// PawPal's built-in replies: answers questions from the owner's own records
// (vaccines, doses, weight, visits, spending, reminders), explains how to use
// PawPrint, and gives safe general care guidance. Used when no Anthropic API
// key is configured, or as a backup if the Claude call fails. Pure functions.
//
// Replies use a tiny Markdown subset the chat window renders: paragraphs,
// "- " bullet lines and **bold**.

// Acute signs, or having eaten something dangerous (asking which foods are
// toxic is a food question, not an emergency)
const EMERGENCY_RE = /\b(bleed|bleeding|chok|can'?t breathe|cannot breathe|not breathing|struggling to breathe|seizure|fitting|collaps|unconscious|hit by a (?:car|bike|vehicle)|bloat|swollen belly|heat ?stroke|broken (?:bone|leg)|snake ?bite|emergency|dying|poisoned)|\b(?:ate|eaten|eats|swallowed|chewed|licked|got into|drank)\b.*\b(chocolate|grapes?|raisins?|xylitol|onions?|garlic|poison|rat bait|antifreeze|medicine|pills?|tablets?|ibuprofen|paracetamol|batter(?:y|ies)|bleach)/i;

// Order matters: the first matching intent wins
const INTENTS = [
  ['greeting', /^\s*(hi|hello|hey|hiya|good (?:morning|afternoon|evening)|namaste|yo)\b[\s!.?]*$/i],
  ['thanks', /^\s*(thanks|thank you|thx|ty|great|awesome|perfect|ok(?:ay)?|cool)\b[\s!.?]*$/i],
  ['reminders', /\b(remind|reminders|to ?do|attention|what(?:'s| is)? (?:due|next|pending)|anything due|coming up|upcoming|should i do)\b/i],
  ['vaccines', /\b(vaccin|vaccine|booster|shot|jab|rabies|dhpp|parvo|distemper|lepto|bordetella|kennel cough|fvrcp|felv|immuni[sz])/i],
  ['medications', /\b(meds?\b|medication|medicine|dose|doses|pill|tablet|drops|syrup|prescription|apoquel|antibiotic|dewormer|deworm|flea|tick)/i],
  ['weight', /\b(weight|weigh|kg|heavy|fat|overweight|underweight|thin|skinny|obese|diet plan)\b/i],
  ['appointments', /\b(appointment|visit|vet visit|check-?up|booking|book|schedule|consult)\b/i],
  ['expenses', /\b(spend|spent|spending|cost|costs|expense|expenses|money|budget|paid|price)\b/i],
  ['allergies', /\b(allerg)/i],
  ['emergencyInfo', /\b(microchip|chip|emergency contact|contact number)\b/i],
  ['symptoms', /\b(vomit|throw(?:ing)? up|puk|diarrh|loose (?:stool|motion)|not eating|won'?t eat|off (?:food|his food|her food)|letharg|tired|sleepy|limp|itch|scratch|cough|sneez|fever|shak|trembl|lump|bump|drink(?:ing)? (?:a lot|more)|pee(?:ing)? (?:a lot|more)|bad breath|ears?\b|eye discharge|hair loss|sick|unwell|pain)/i],
  ['food', /\b(food|foods|feed|feeding|eat|diet|treat|treats|kibble|meal|nutrition|water|toxic|poisonous|safe to eat)\b/i],
  ['grooming', /\b(groom|bath|brush|nail|claw|teeth|dental|shed)/i],
  ['exercise', /\b(walk|exercise|play|activity|run|active)\b/i],
  ['appHelp', /\b(how (?:do|can|to)|where (?:do|can|is)|add (?:a )?pet|share|export|download|upload|pdf|dark mode|theme|password|delete (?:my )?account|currency|email reminder|notification|log ?out|sign ?out|search|calendar|csv|use pawprint|features?)\b/i],
  // General "how is she doing" only after the specific topics above had their chance
  ['summary', /\b(summary|summari[sz]e|overview|how is|how's|status|update me|everything|health check)\b/i],
  ['about', /\b(who are you|what (?:are|can) you|what is pawprint|about pawprint|help)\b/i],
];

function detectIntent(text) {
  const q = String(text || '');
  if (EMERGENCY_RE.test(q)) return 'emergency';
  for (const [intent, re] of INTENTS) if (re.test(q)) return intent;
  return 'unknown';
}

// Dashboard links shown as buttons under a reply
const TAB_LINK = {
  vaccines: { label: 'Open vaccinations', tab: 'vaccinations' },
  medications: { label: "Today's doses", tab: 'medications' },
  weight: { label: 'Weight tracker', tab: 'weight-tracking' },
  appointments: { label: 'Appointments', tab: 'vet-appointments' },
  expenses: { label: 'Expenses', tab: 'expenses' },
  reminders: { label: 'Smart reminders', tab: 'reminders' },
  summary: { label: 'Overview', tab: 'overview' },
  allergies: { label: 'Profile & ID', tab: 'pet-profiles' },
  emergencyInfo: { label: 'Profile & ID', tab: 'pet-profiles' },
};

/** Buttons to show under a reply for this intent (paths in the web app). */
function actionsFor(intent, petId, signedIn) {
  if (!signedIn) {
    return intent === 'greeting' || intent === 'about' || intent === 'appHelp' || intent === 'unknown'
      ? [{ label: 'Create a free account', to: '/signup' }, { label: 'Log in', to: '/login' }]
      : [];
  }
  const pet = petId ? `&pet=${petId}` : '';
  if (intent === 'emergency') return petId ? [{ label: 'Open Emergency Mode', to: `/emergency?pet=${petId}` }, { label: 'Find a nearby vet', to: `/dashboard?tab=nearby-clinics${pet}` }] : [{ label: 'Find a nearby vet', to: '/dashboard?tab=nearby-clinics' }];
  if (intent === 'symptoms') return [{ label: 'Find a nearby vet', to: `/dashboard?tab=nearby-clinics${pet}` }, { label: 'Book a visit', to: `/dashboard?tab=vet-appointments${pet}` }];
  const link = TAB_LINK[intent];
  return link ? [{ label: link.label, to: `/dashboard?tab=${link.tab}${pet}` }] : [];
}

const money = (amount, currency) => {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: amount % 1 ? 2 : 0 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

const prettyDate = (key) => new Date(`${key.slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

const inDays = (days) => {
  if (days < -1) return `${Math.abs(days)} days overdue`;
  if (days === -1) return '1 day overdue';
  if (days === 0) return 'due today';
  if (days === 1) return 'due tomorrow';
  return `due in ${days} days`;
};

const its = (pet) => (pet.gender === 'male' ? 'his' : pet.gender === 'female' ? 'her' : 'their');

// Which pets a question is about: one named in it, else the one open in the app, else all
function petsInFocus(question, context, focusPetId) {
  const named = context.pets.filter((p) => new RegExp(`\\b${p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(question));
  if (named.length) return named;
  const focused = context.pets.find((p) => p.id === focusPetId);
  if (focused && !/\b(all|every|each|both|my pets)\b/i.test(question)) return [focused];
  return context.pets;
}

// ── Per-topic answers from the records ──────────────────────────────────────

function vaccineLines(pet) {
  if (!pet.vaccines.length) return [`**${pet.name}** has no vaccinations recorded yet. Add ${its(pet)} last shots in Vaccinations and I'll track the boosters.`];
  const overdue = pet.vaccines.filter((v) => v.status === 'overdue');
  const soon = pet.vaccines.filter((v) => v.status === 'due soon');
  const lines = [overdue.length
    ? `**${pet.name}** has ${overdue.length} overdue vaccine${overdue.length === 1 ? '' : 's'} — please book a booster soon:`
    : soon.length
      ? `**${pet.name}** is protected right now, with ${soon.length} booster${soon.length === 1 ? '' : 's'} coming up:`
      : `**${pet.name}** is fully up to date on vaccines. 🎉 Next boosters:`];
  for (const v of [...overdue, ...soon, ...pet.vaccines.filter((x) => x.status === 'up to date')].slice(0, 5)) {
    lines.push(`- ${v.name} — ${inDays(v.daysUntil)} (${prettyDate(v.nextDue)})`);
  }
  return lines;
}

function medicationLines(pet) {
  if (!pet.medications.length) return [`**${pet.name}** isn't on any medication right now.`];
  const lines = [`**${pet.name}**'s medication today:`];
  for (const m of pet.medications) {
    const what = `${m.name}${m.dosage ? ` (${m.dosage})` : ''}`;
    if (m.dueToday === 0) lines.push(`- ${what} — ${m.frequency.toLowerCase()}, nothing due today`);
    else if (m.remainingToday === 0) lines.push(`- ${what} — all ${m.dueToday} dose${m.dueToday === 1 ? '' : 's'} given ✅`);
    else lines.push(`- ${what} — **${m.remainingToday} of ${m.dueToday} dose${m.dueToday === 1 ? '' : 's'} still to give**${m.instructions ? ` · ${m.instructions}` : ''}`);
    if (m.endsInDays !== null && m.endsInDays >= 0 && m.endsInDays <= 7) lines.push(`  Course ends ${m.endsInDays === 0 ? 'today' : `in ${m.endsInDays} day${m.endsInDays === 1 ? '' : 's'}`}.`);
  }
  lines.push('Tick doses off in Medications so the streak and reminders stay accurate.');
  return lines;
}

function weightLines(pet) {
  const w = pet.weight;
  if (!w) return [`There are no weigh-ins for **${pet.name}** yet. Log one in the Weight tab and I'll track the trend.`];
  const lines = [`**${pet.name}** weighed **${w.latestKg} kg** on ${prettyDate(w.latestDate)}.`];
  if (w.changePercent !== null) {
    const dir = w.changePercent > 0 ? 'up' : w.changePercent < 0 ? 'down' : 'unchanged';
    lines.push(dir === 'unchanged' ? '- That\'s the same as the previous weigh-in.' : `- That's ${dir} ${Math.abs(w.changePercent)}% from the previous weigh-in (${w.previousKg} kg).`);
  }
  const { min, max } = pet.targetWeight;
  if (min != null || max != null) {
    const range = min != null && max != null ? `${min}–${max} kg` : min != null ? `at least ${min} kg` : `up to ${max} kg`;
    if (max != null && w.latestKg > max) lines.push(`- Above ${its(pet)} healthy range (${range}). Ask your vet about portion sizes and exercise.`);
    else if (min != null && w.latestKg < min) lines.push(`- Below ${its(pet)} healthy range (${range}). If it keeps dropping, check in with your vet.`);
    else lines.push(`- Within ${its(pet)} healthy range (${range}). 👍`);
  } else {
    lines.push('- Tip: set a healthy weight range in Edit profile and I\'ll tell you when they drift outside it.');
  }
  if (Math.abs(w.changePercent || 0) >= 10) lines.push('A change of 10% or more between weigh-ins is worth mentioning to your vet.');
  return lines;
}

function appointmentLines(pet) {
  const next = pet.upcomingAppointments[0];
  if (!next) return [`Nothing is booked for **${pet.name}**. You can book a visit in Appointments and get a calendar invite.`];
  const when = new Date(next.date);
  const lines = [`**${pet.name}**'s next visit: **${when.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}** at ${when.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}${next.clinic ? `, ${next.clinic}` : ''}${next.reason ? ` — ${next.reason}` : ''}.`];
  if (pet.upcomingAppointments.length > 1) lines.push(`- Plus ${pet.upcomingAppointments.length - 1} more booked after that.`);
  return lines;
}

function expenseLines(pets, currency) {
  const month = pets.reduce((s, p) => s + p.spending.thisMonth, 0);
  const year = pets.reduce((s, p) => s + p.spending.thisYear, 0);
  const who = pets.length === 1 ? `on **${pets[0].name}**` : 'across your pets';
  const lines = [`You've spent **${money(month, currency)}** ${who} this month, and **${money(year, currency)}** so far this year.`];
  if (pets.length > 1) for (const p of pets) lines.push(`- ${p.name}: ${money(p.spending.thisMonth, currency)} this month`);
  lines.push('The Expenses tab breaks it down by category and month, and exports a CSV.');
  return lines;
}

function reminderLines(context, pets) {
  const ids = new Set(pets.map((p) => p.id));
  const list = context.reminders.filter((r) => ids.has(r.petId));
  if (!list.length) return [`All caught up! Nothing is overdue or due soon for ${pets.length === 1 ? `**${pets[0].name}**` : 'your pets'}. 🐾`];
  const rank = { urgent: 0, upcoming: 1, info: 2 };
  const sorted = [...list].sort((a, b) => rank[a.urgency] - rank[b.urgency]);
  const lines = [`Here's what needs attention${pets.length === 1 ? ` for **${pets[0].name}**` : ''}:`];
  for (const r of sorted.slice(0, 6)) lines.push(`- ${r.urgency === 'urgent' ? '🔴' : r.urgency === 'upcoming' ? '🟠' : '🔵'} ${pets.length > 1 ? `${r.petName}: ` : ''}${r.title}`);
  if (sorted.length > 6) lines.push(`…and ${sorted.length - 6} more in Smart Reminders.`);
  return lines;
}

function summaryLines(context, pet) {
  const overdue = pet.vaccines.filter((v) => v.status === 'overdue').length;
  const dosesLeft = pet.medications.reduce((s, m) => s + m.remainingToday, 0);
  const next = pet.upcomingAppointments[0];
  const lines = [`Here's **${pet.name}** at a glance${pet.breed ? ` (${pet.breed}${pet.age ? `, ${pet.age}` : ''})` : ''}:`];
  lines.push(`- Vaccines: ${pet.vaccines.length ? (overdue ? `**${overdue} overdue**` : 'up to date') : 'none recorded'}`);
  lines.push(`- Medication: ${pet.medications.length ? (dosesLeft ? `**${dosesLeft} dose${dosesLeft === 1 ? '' : 's'} left today**` : 'all doses given today') : 'none active'}`);
  lines.push(`- Weight: ${pet.weight ? `${pet.weight.latestKg} kg (${prettyDate(pet.weight.latestDate)})` : 'no weigh-ins yet'}`);
  lines.push(`- Next visit: ${next ? `${prettyDate(next.date)}${next.clinic ? ` at ${next.clinic}` : ''}` : 'nothing booked'}`);
  lines.push(`- Spent this month: ${money(pet.spending.thisMonth, context.owner.currency)}`);
  if (pet.allergies.length) lines.push(`- Allergies: ${pet.allergies.join(', ')}`);
  return lines;
}

// ── General guidance (not tied to records) ──────────────────────────────────

const EMERGENCY_TEXT = [
  '**This could be an emergency — please contact a vet or emergency animal hospital right now.** Don\'t wait to see if it passes.',
  '- Keep your pet calm, warm and still, and bring any packaging if they ate something.',
  '- Don\'t make them vomit or give human medicine unless a vet tells you to.',
  '- If you can, call ahead so the clinic is ready for you.',
  'Emergency Mode shows their allergies, medications, microchip and emergency contacts in one tap for the vet.',
];

const SYMPTOM_TEXT = {
  base: [
    'I can\'t diagnose, but here\'s a safe way to think about it:',
    '- **See a vet today** if your pet is very young, old or has other conditions, is in pain, has blood in vomit or stool, can\'t keep water down, or seems weak or unusually quiet.',
    '- For a mild, one-off episode in an otherwise bright pet: offer fresh water, watch closely for 12–24 hours, and call your vet if it repeats or anything worsens.',
    '- Write down when it started and what they ate — it helps your vet a lot.',
  ],
};

const GENERAL = {
  food: [
    'A few feeding basics that suit most pets:',
    '- Use a complete, balanced food made for their species and life stage (puppy/kitten, adult, senior).',
    '- Measure meals and keep treats under ~10% of daily calories.',
    '- Always have fresh water out.',
    '- Never give grapes, raisins, chocolate, onions, garlic, xylitol (sugar-free gum) or cooked bones.',
    'Your vet can suggest a daily portion based on their weight and activity.',
  ],
  grooming: [
    'Grooming basics:',
    '- Brush a few times a week (daily for long coats) to cut shedding and matting.',
    '- Trim nails every 3–4 weeks — stop short of the pink quick.',
    '- Brush teeth with pet toothpaste (never human toothpaste) a few times a week.',
    '- Bathe only when needed with a pet shampoo.',
  ],
  exercise: [
    'Activity guide:',
    '- Most adult dogs need 30–120 minutes a day depending on breed and age; split into walks and play.',
    '- Cats do best with a few short play sessions a day (wand toys, chase games).',
    '- Avoid hard exercise right after meals and in the hottest part of the day.',
  ],
  allergiesGeneral: [
    'Signs of allergies include itching, licking paws, ear infections, red skin and tummy upsets. Your vet can help find the trigger.',
  ],
};

const APP_HELP = [
  [/add (?:a |another )?pet|new pet/i, 'To add a pet, open the pet switcher at the top of the sidebar and choose **Add another pet** (or **Add your first pet** on a new account).'],
  [/share|vet link|sitter/i, 'Open the pet\'s **Overview** and tap **Share with vet**. You get a read-only link (1, 7 or 30 days) with a QR code — revoke it any time.'],
  [/pdf|summary|print/i, 'Tap **Health summary** on the Overview to get a printable one-page record you can save as a PDF.'],
  [/export|download (?:my )?data|backup/i, 'Go to **Settings → Your data → Download my data** for a full JSON export. Expenses can also be exported as a CSV from the Expenses tab.'],
  [/upload|document|file|vault/i, 'Use the **Medical Vault** tab to upload prescriptions, reports and insurance papers (PDF, JPG, PNG or WebP up to 10 MB).'],
  [/dark mode|theme|light mode/i, 'Use the moon/sun button in the top bar (or Settings → Appearance) to switch between light, dark and system themes.'],
  [/password/i, 'Change your password in **Settings → Security**. Forgot it? Use **Forgot password?** on the login page to get a reset email.'],
  [/delete (?:my )?account/i, 'You can delete your account and every record in **Settings → Danger zone**. This can\'t be undone, so download your data first.'],
  [/currency/i, 'Change the currency for expenses in **Settings → Preferences**.'],
  [/email reminder|notification|alert/i, 'Turn on **Email reminders** in Settings for a daily 8 AM digest, and allow browser notifications from the bell in the top bar.'],
  [/calendar/i, 'Each booked appointment has an **Add to calendar** option, and confirmation emails include a calendar invite.'],
  [/search/i, 'Press **Ctrl/⌘ + K** or use the search bar at the top to find any vaccine, visit, document or expense.'],
  [/log ?out|sign ?out/i, 'Open your account menu (your initials, bottom-left in the dashboard) and choose **Log out**.'],
];

function appHelpLines(question) {
  const hit = APP_HELP.find(([re]) => re.test(question));
  if (hit) return [hit[1]];
  return [
    'PawPrint keeps everything about your pet in one place:',
    '- **Vaccinations** with booster reminders',
    '- **Medications** with a daily dose checklist and streaks',
    '- **Weight** trends against a healthy range',
    '- **Appointments** with calendar invites, and **Nearby clinics**',
    '- **Expenses**, a **Medical Vault** for documents, and a full **Timeline**',
    '- **Emergency Mode** and shareable vet links',
    'Ask me something like "When is the next vaccine due?" or "How do I share records with my vet?"',
  ];
}

const SUGGESTIONS_SIGNED_IN = ['What needs attention today?', 'When is the next vaccine due?', 'Have all doses been given today?', 'How much did I spend this month?'];
const SUGGESTIONS_GUEST = ['What can PawPrint do?', 'What foods are toxic to dogs?', 'How often should I trim nails?', 'Is my data private?'];

/**
 * Answers one question.
 * @param {string} question
 * @param {object|null} context — from loadAssistantContext, or null for a guest
 * @param {string} [focusPetId] — the pet open in the app
 * @returns {{ text: string, intent: string, petId: string|null }}
 */
function replyLocally(question, context, focusPetId) {
  const intent = detectIntent(question);
  const signedIn = Boolean(context);
  const pets = signedIn && context.pets.length ? petsInFocus(question, context, focusPetId) : [];
  const petId = pets.length === 1 ? pets[0].id : focusPetId || null;
  const done = (lines) => ({ text: lines.join('\n'), intent, petId });

  if (intent === 'emergency') return done(EMERGENCY_TEXT);
  if (intent === 'symptoms') return done(SYMPTOM_TEXT.base);
  if (intent === 'food') return done(GENERAL.food);
  if (intent === 'grooming') return done(GENERAL.grooming);
  if (intent === 'exercise') return done(GENERAL.exercise);
  if (intent === 'appHelp') return done(appHelpLines(question));
  if (intent === 'thanks') return done(['Any time! 🐾 Ask me whenever something comes up.']);

  if (!signedIn) {
    if (/privat|secur|safe|data/i.test(question)) {
      return done(['Your records are private to your account. Nothing is shared unless you create a share link, and you can download or delete everything from Settings at any time.']);
    }
    if (intent === 'greeting' || intent === 'about' || intent === 'unknown') {
      return done([
        'Hi, I\'m **PawPal** 🐾 — PawPrint\'s care assistant.',
        'I can explain how PawPrint works and share general pet-care tips. Once you sign in, I can also answer questions about your own pet\'s vaccines, doses, weight, visits and spending.',
      ]);
    }
    if (intent === 'allergies') return done(GENERAL.allergiesGeneral);
    return done(['Sign in and I can answer that from your pet\'s own records. Until then, ask me how PawPrint works or for general care tips.']);
  }

  if (!context.pets.length) {
    return done([
      `Hi${context.owner.firstName ? ` ${context.owner.firstName}` : ''}! Add your first pet and I'll be able to answer questions about their vaccines, doses, weight, visits and costs.`,
      'Meanwhile, ask me for general care tips or how PawPrint works.',
    ]);
  }

  const each = (fn) => pets.flatMap((p, i) => (i ? ['', ...fn(p)] : fn(p)));
  switch (intent) {
    case 'greeting':
      return done([
        `Hi${context.owner.firstName ? ` ${context.owner.firstName}` : ''}! I'm **PawPal** 🐾`,
        `I know ${context.pets.map((p) => p.name).join(', ')}'s records, so you can ask things like what's due, whether doses were given, weight trends or spending.`,
      ]);
    case 'about':
      return done(appHelpLines(''));
    case 'summary':
      return done(each((p) => summaryLines(context, p)));
    case 'reminders':
      return done(reminderLines(context, pets));
    case 'vaccines':
      return done(each(vaccineLines));
    case 'medications':
      return done(each(medicationLines));
    case 'weight':
      return done(each(weightLines));
    case 'appointments':
      return done(each(appointmentLines));
    case 'expenses':
      return done(expenseLines(pets, context.owner.currency));
    case 'allergies':
      return done(pets.map((p) => (p.allergies.length ? `**${p.name}** is allergic to: ${p.allergies.join(', ')}.` : `No allergies recorded for **${p.name}**.`)));
    case 'emergencyInfo':
      return done(pets.flatMap((p) => [
        `**${p.name}**: ${p.microchipped ? 'microchipped ✅' : 'no microchip recorded'}.`,
        ...(p.emergencyContacts.length ? p.emergencyContacts.map((c) => `- ${c.name}${c.phone ? ` — ${c.phone}` : ''}`) : ['- No emergency contacts yet — add them in Edit profile.']),
      ]));
    default:
      return done([
        'I\'m not sure I understood that one. I can help with:',
        '- what\'s due or overdue, today\'s doses, weight trends, upcoming visits and spending',
        '- how to use PawPrint (sharing, exports, reminders…)',
        '- general care tips on food, grooming, exercise and when to see a vet',
      ]);
  }
}

module.exports = { detectIntent, actionsFor, replyLocally, SUGGESTIONS_SIGNED_IN, SUGGESTIONS_GUEST };
