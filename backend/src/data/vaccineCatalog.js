// Common pet vaccines with a TYPICAL adult booster interval, used to pre-fill
// the "next due" date when an owner logs a dose. Schedules vary by country,
// local law (rabies), the vaccine brand and the pet's lifestyle — the vet's
// advice always wins, and the UI says so. Puppies and kittens need a series of
// shots several weeks apart, which owners enter as individual doses.

const VACCINE_CATALOG = {
  dog: [
    { name: 'Rabies', core: true, intervalMonths: 12, description: 'Required by law in many places. Some vaccines are licensed for 3 years after the first booster.' },
    { name: 'DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)', core: true, intervalMonths: 12, description: 'Core combination vaccine. Often every 3 years once the adult booster is done — ask your vet.' },
    { name: 'Leptospirosis', core: false, intervalMonths: 12, description: 'Bacterial disease spread through water and wildlife. Needs a yearly booster.' },
    { name: 'Bordetella (Kennel Cough)', core: false, intervalMonths: 12, description: 'Recommended for dogs that board, groom or meet many other dogs.' },
    { name: 'Canine Influenza', core: false, intervalMonths: 12, description: 'For social dogs in areas with outbreaks.' },
    { name: 'Lyme Disease', core: false, intervalMonths: 12, description: 'For dogs in tick-prone areas.' },
  ],
  cat: [
    { name: 'Rabies', core: true, intervalMonths: 12, description: 'Required by law in many places. Some vaccines are licensed for 3 years.' },
    { name: 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)', core: true, intervalMonths: 12, description: 'Core combination vaccine. Often every 3 years for adult indoor cats — ask your vet.' },
    { name: 'FeLV (Feline Leukemia)', core: false, intervalMonths: 12, description: 'Recommended for kittens and cats that go outdoors.' },
    { name: 'Chlamydia (Feline)', core: false, intervalMonths: 12, description: 'For multi-cat homes or catteries with a history of infection.' },
  ],
  other: [
    { name: 'Rabies', core: true, intervalMonths: 12, description: 'Ask your vet which vaccines your pet needs.' },
  ],
};

module.exports = { VACCINE_CATALOG };
