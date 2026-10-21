const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { isDateKey, localDateKey } = require('../services/medicationSchedule.service');
const { loadAssistantContext } = require('../services/assistantContext.service');
const { replyLocally, detectIntent, actionsFor, SUGGESTIONS_SIGNED_IN, SUGGESTIONS_GUEST } = require('../services/assistantLocal.service');
const { isClaudeConfigured, streamClaudeReply } = require('../services/assistantClaude.service');

const MAX_MESSAGES = 20;
const MAX_CHARS = 2000;

// The conversation so far, oldest first, ending with the user's new message
function readMessages(body) {
  const list = body?.messages;
  if (!Array.isArray(list) || list.length === 0) throw new ApiError(400, 'Please type a message.');
  const recent = list.slice(-MAX_MESSAGES);
  const last = recent[recent.length - 1];
  if (typeof last?.content === 'string' && last.content.trim().length > MAX_CHARS) throw new ApiError(400, `Messages can be up to ${MAX_CHARS} characters.`);
  // Earlier turns are trimmed rather than rejected
  const messages = recent.map((m) => {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') {
      throw new ApiError(400, 'That message could not be read. Please try again.');
    }
    const content = m.content.trim().slice(0, MAX_CHARS);
    return { role: m.role, content };
  }).filter((m) => m.content);
  // The model needs the history to start with the user and end with their new question
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== 'user') throw new ApiError(400, 'Please type a message.');
  return messages;
}

// GET /assistant/status — which engine answers, and starter questions
const status = asyncHandler(async (req, res) => {
  res.json({
    mode: isClaudeConfigured() ? 'claude' : 'built-in',
    signedIn: Boolean(req.userId),
    suggestions: req.userId ? SUGGESTIONS_SIGNED_IN : SUGGESTIONS_GUEST,
  });
});

// POST /assistant/chat { messages: [{ role, content }], petId?, date? }
// Streams newline-delimited JSON: { type: 'text', text } chunks, then
// { type: 'done', source, actions } (or { type: 'error', message }).
const chat = asyncHandler(async (req, res) => {
  const messages = readMessages(req.body);
  const question = messages[messages.length - 1].content;
  const todayKey = isDateKey(req.body?.date) ? req.body.date : localDateKey();
  const context = await loadAssistantContext(req.userId, todayKey);
  const focusPet = context?.pets.find((p) => p.id === req.body?.petId) || (context?.pets.length === 1 ? context.pets[0] : null);

  res.status(200);
  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
  const send = (obj) => res.write(`${JSON.stringify(obj)}\n`);

  const local = replyLocally(question, context, focusPet?.id);
  const actions = actionsFor(detectIntent(question), local.petId, Boolean(context));

  // Stop the model call if the person closes the chat mid-answer
  const abort = new AbortController();
  res.on('close', () => { if (!res.writableEnded) abort.abort(); });

  if (isClaudeConfigured()) {
    let wrote = false;
    try {
      const { refused } = await streamClaudeReply({
        messages,
        context,
        focusPetName: focusPet?.name,
        signal: abort.signal,
        onText: (text) => { wrote = true; send({ type: 'text', text }); },
      });
      if (refused && !wrote) send({ type: 'text', text: local.text });
      send({ type: 'done', source: 'claude', actions });
      return res.end();
    } catch (err) {
      if (abort.signal.aborted) return res.end();
      console.error('[assistant] Claude request failed:', err.status || '', err.message);
      if (wrote) {
        send({ type: 'error', message: 'Sorry, I lost my connection partway through. Please ask again.' });
        return res.end();
      }
      // Nothing sent yet — answer with the built-in replies instead
    }
  }

  send({ type: 'text', text: local.text });
  send({ type: 'done', source: 'built-in', actions });
  res.end();
});

module.exports = { status, chat };
