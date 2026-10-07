import { SkinCategoryInfo } from '../types';

export const SKIN_CATEGORIES: Record<string, SkinCategoryInfo> = {
  nv: {
    code: 'nv',
    shortCode: 'NV',
    name: 'Melanocytic Nevus',
    clinicalName: 'Benign Melanocytic Nevus (Common Mole)',
    categoryType: 'Benign',
    riskLevel: 'benign-low',
    description: 'A common benign proliferation of melanocytes (pigment-producing cells). These are typically symmetric with uniform pigment distribution and well-defined borders.',
    whatItMeans: 'The AI model identified characteristic dermoscopic features typical of a benign melanocytic nevus (regular pigment network, uniform globules, or homogenous pattern).',
    whatItDoesNotMean: 'This AI screening does NOT guarantee the lesion is completely harmless or permanent. Benign nevi can occasionally undergo atypical transformation.',
    clinicalCharacteristics: [
      'Symmetric architecture across both axes',
      'Uniform pigment network or homogenous brown coloration',
      'Sharp, regular, well-demarcated border',
      'Stable size, typically under 6mm in diameter'
    ],
    recommendedNextSteps: [
      'Practice monthly self-examination using the ABCDE rule',
      'Protect skin from excessive ultraviolet (UV) radiation with SPF 30+',
      'Schedule routine annual dermatological skin checks',
      'Consult a dermatologist promptly if you observe asymmetry, color variation, or rapid growth'
    ]
  },
  mel: {
    code: 'mel',
    shortCode: 'MEL',
    name: 'Melanoma (Suspected)',
    clinicalName: 'Malignant Melanoma / Atypical Melanocytic Proliferation',
    categoryType: 'Malignant',
    riskLevel: 'malignant-suspected',
    description: 'A potentially aggressive cutaneous malignancy originating from melanocytes. Highly treatable when identified at an early stage via dermatological excision.',
    whatItMeans: 'The AI model detected atypical features such as irregular pigment networks, atypical dots/globules, asymmetry, or blue-white veil patterns commonly associated with melanocytic atypia.',
    whatItDoesNotMean: 'This is NOT a formal histopathological cancer diagnosis. Definitive diagnosis requires physical dermatoscopy, dermoscopic examination, and surgical biopsy by a licensed physician.',
    clinicalCharacteristics: [
      'Asymmetric shape and uneven topography',
      'Irregular, scalloped, or poorly defined borders',
      'Color variegation (multiple shades of tan, dark brown, black, red, or white)',
      'Diameter often exceeds 6mm (though early melanomas can be smaller)',
      'Evolving appearance, elevation, or symptomatic bleeding/itching'
    ],
    recommendedNextSteps: [
      'URGENT: Schedule an in-person evaluation with a board-certified dermatologist',
      'Do not attempt to scrape, scratch, or treat the lesion at home',
      'Bring this screening summary and date of lesion onset to your doctor',
      'Inquire about a full-body dermatoscopic skin examination and biopsy if indicated'
    ]
  },
  bcc: {
    code: 'bcc',
    shortCode: 'BCC',
    name: 'Basal Cell Carcinoma (Suspected)',
    clinicalName: 'Basal Cell Carcinoma (Non-Melanoma Skin Cancer)',
    categoryType: 'Malignant',
    riskLevel: 'malignant-suspected',
    description: 'The most common form of skin cancer, arising from basal cells in the epidermis. Grows slowly and rarely metastasizes, but can cause localized tissue destruction if untreated.',
    whatItMeans: 'The AI model detected structural patterns typical of BCC, such as arborizing (tree-like) telangiectasias, shiny translucent pearly borders, or ulceration.',
    whatItDoesNotMean: 'This AI screening does not determine lesion depth, subtype (nodular, superficial, or morpheaform), or staging. Only clinical histopathology can confirm this.',
    clinicalCharacteristics: [
      'Pearly, translucent, or waxy bump or firm pink nodule',
      'Visible branching fine blood vessels (telangiectasias)',
      'Central depression, non-healing sore, or recurrent bleeding/crusting',
      'Rolled border with central atrophy'
    ],
    recommendedNextSteps: [
      'Arrange an appointment with a dermatologist for clinical examination',
      'Avoid picking or disturbing the lesion surface',
      'Discuss treatment modalities (e.g. Mohs micrographic surgery, excision, or topical therapy)',
      'Wear broad-spectrum SPF 50+ sunscreen daily'
    ]
  },
  akiec: {
    code: 'akiec',
    shortCode: 'AKIEC',
    name: 'Actinic Keratosis / In-Situ Carcinoma',
    clinicalName: 'Actinic Keratosis / Intraepithelial Carcinoma (Bowen Disease)',
    categoryType: 'Pre-Malignant',
    riskLevel: 'pre-malignant',
    description: 'A rough, scaly patch on sun-exposed skin considered a pre-malignant precursor that may over time progress to invasive squamous cell carcinoma if left untreated.',
    whatItMeans: 'The model identified surface roughness, erythematous background, or strawberry pattern typical of solar keratotic transformation.',
    whatItDoesNotMean: 'This does not mean invasive cancer is present today. It highlights an area of cumulative photodamage requiring preventative clinical attention.',
    clinicalCharacteristics: [
      'Rough, gritty texture (often felt before seen)',
      'Erythematous (reddish/pink) scaly plaque or hyperkeratotic crust',
      'Located on sun-exposed anatomical sites (face, scalp, forearms, hands)',
      'Mild sensitivity or tenderness when rubbed'
    ],
    recommendedNextSteps: [
      'Consult a dermatologist for preventative evaluation and field therapy',
      'Inquire about cryotherapy, topical field treatments (e.g., 5-FU), or photodynamic therapy',
      'Implement strict daily UV protection with wide-brimmed hats and SPF 50+',
      'Conduct regular checks for thickened or rapidly enlarging lesions'
    ]
  },
  scc: {
    code: 'scc',
    shortCode: 'SCC',
    name: 'Squamous Cell Carcinoma (Suspected)',
    clinicalName: 'Cutaneous Squamous Cell Carcinoma (cSCC)',
    categoryType: 'Malignant',
    riskLevel: 'malignant-suspected',
    description: 'The second most common form of skin cancer, arising from squamous cells in the outer layers of the skin. Often develops on chronically sun-exposed areas.',
    whatItMeans: 'The AI model identified hyperkeratotic crusting, induration, central ulceration, or keratin pearls typical of cutaneous squamous cell carcinoma.',
    whatItDoesNotMean: 'Only a physical histopathologic punch or shave biopsy can definitively confirm invasive squamous cell carcinoma.',
    clinicalCharacteristics: [
      'Firm red nodule or flat sore with scaly crust',
      'New sore or raised area on an old scar or ulcer',
      'Rough scaly patch on the lip that may evolve into an open sore',
      'Tenderness or persistent spontaneous bleeding'
    ],
    recommendedNextSteps: [
      'Schedule a prompt dermatological clinical evaluation',
      'Avoid scratching, squeezing, or rubbing the lesion',
      'Prepare history of sun exposure and previous skin lesions',
      'Discuss surgical excision or Mohs surgery with your specialist'
    ]
  },
  bkl: {
    code: 'bkl',
    shortCode: 'BKL',
    name: 'Benign Keratosis',
    clinicalName: 'Seborrheic Keratosis / Solar Lentigo / Lichenoid Keratosis',
    categoryType: 'Benign',
    riskLevel: 'benign-low',
    description: 'Extremely common non-cancerous skin growth that develops with age and sun exposure. Often appears "stuck-on" with a warty, waxy, or pigmented surface.',
    whatItMeans: 'The AI model identified classic benign keratinocytic features like milia-like cysts, comedo-like openings, or fingerprint structures.',
    whatItDoesNotMean: 'While biologically harmless, inflamed or atypical keratoses can sometimes mimic melanoma on visual inspection alone.',
    clinicalCharacteristics: [
      '"Stuck on" appearance as if melted candle wax or barnacle on skin',
      'Waxy, scaly, or verrucous (wart-like) surface texture',
      'Color ranges from light tan to dark brown or black',
      'Sharp, clearly defined borders without invasive margins'
    ],
    recommendedNextSteps: [
      'No immediate medical intervention is typically needed for asymptomatic benign keratoses',
      'Monitor for irritation caused by clothing friction or jewelry',
      'Have any suddenly changing, itching, or bleeding lesion verified by a clinician',
      'Elective cosmetic removal can be discussed with a dermatologist if bothersome'
    ]
  },
  df: {
    code: 'df',
    shortCode: 'DF',
    name: 'Dermatofibroma',
    clinicalName: 'Benign Cutaneous Dermatofibroma (Histiocytoma)',
    categoryType: 'Benign',
    riskLevel: 'benign-low',
    description: 'A harmless, firm, fibrous nodule frequently found on the extremities (especially lower legs), often triggered by a minor injury or insect bite.',
    whatItMeans: 'The AI model detected a central white scar-like patch surrounded by a delicate peripheral pigment network, characteristic of dermatofibroma.',
    whatItDoesNotMean: 'This AI screening cannot physically palpate the skin to perform the clinical "dimple sign" test (invagination upon lateral compression).',
    clinicalCharacteristics: [
      'Firm, hard button-like dermal nodule',
      'Positive "pinch / dimple" sign when squeezed laterally',
      'Color varies from pinkish-red to brown or yellowish-gray',
      'Slow growing and typically under 1cm in diameter'
    ],
    recommendedNextSteps: [
      'Routine reassurance; dermatofibromas are harmless and require no treatment',
      'Avoid attempting to squeeze or cut the nodule',
      'Seek clinical confirmation if the lesion expands rapidly or becomes painful',
      'Report any ulceration or bleeding to a physician'
    ]
  },
  vasc: {
    code: 'vasc',
    shortCode: 'VASC',
    name: 'Vascular Lesion',
    clinicalName: 'Benign Vascular Lesion (Cherry Angioma / Hemangioma / Pyogenic Granuloma)',
    categoryType: 'Vascular',
    riskLevel: 'benign-low',
    description: 'A benign collection or proliferation of small blood vessels in the skin, giving the lesion a characteristic bright red, purple, or deep crimson hue.',
    whatItMeans: 'The AI model recognized red-blue lacunae or vascular lagoons without atypical pigment structures, indicative of a benign vascular lesion.',
    whatItDoesNotMean: 'Rapidly bleeding vascular lesions (such as pyogenic granulomas) or nodular pigmented lesions still require direct clinical distinction from amelanotic melanoma.',
    clinicalCharacteristics: [
      'Bright red, purple, or violaceous macule or papule',
      'Smooth dome-shaped contour or lacunar vascular pattern',
      'Blanches partially when pressed with a glass slide (diascopy)',
      'May bleed easily if accidentally scratched or traumatized'
    ],
    recommendedNextSteps: [
      'Generally harmless; no treatment required unless cosmetically desired or prone to bleeding',
      'Protect from direct physical trauma or abrasion',
      'If frequent bleeding occurs, consult a dermatologist for simple cauterization or laser therapy',
      'Have any fast-growing dark or non-blanching red-black lesion evaluated promptly'
    ]
  },
  eczema: {
    code: 'eczema',
    shortCode: 'ECZ',
    name: 'Eczema / Atopic Dermatitis',
    clinicalName: 'Atopic Dermatitis / Pruritic Eczematous Dermatitis',
    categoryType: 'Infectious/Inflammatory',
    riskLevel: 'benign-monitoring',
    description: 'A chronic inflammatory skin condition characterized by dry, itchy, erythematous patches, often exacerbated by environmental triggers or barrier dysfunction.',
    whatItMeans: 'The AI model identified poorly demarcated erythematous patches with microvesiculation, excoriations, or mild lichenification characteristic of eczema.',
    whatItDoesNotMean: 'This does not determine the specific trigger (allergen, irritant, or genetic barrier defect) or whether secondary bacterial superinfection is present.',
    clinicalCharacteristics: [
      'Intense pruritus (itching), often worsening at night',
      'Erythematous, ill-defined patches with mild scaling',
      'Skin thickening (lichenification) from chronic scratching',
      'Common in flexural areas (antecubital and popliteal fossae, neck, wrists)'
    ],
    recommendedNextSteps: [
      'Apply thick fragrance-free emollient moisturizers multiple times daily',
      'Avoid harsh soaps, detergents, and known contact irritants',
      'Consult a clinician or dermatologist regarding topical anti-inflammatory therapies',
      'Seek prompt medical advice if yellow crusting or weeping indicates secondary infection'
    ]
  },
  psoriasis: {
    code: 'psoriasis',
    shortCode: 'PSO',
    name: 'Plaque Psoriasis',
    clinicalName: 'Psoriasis Vulgaris / Chronic Plaque Psoriasis',
    categoryType: 'Infectious/Inflammatory',
    riskLevel: 'benign-monitoring',
    description: 'An immune-mediated chronic inflammatory skin condition characterized by well-demarcated salmon-pink plaques covered with coarse, silvery-white micaceous scales.',
    whatItMeans: 'The AI model recognized sharply defined erythematous borders, raised plaque architecture, and silvery scale distribution typical of psoriasis.',
    whatItDoesNotMean: 'This AI screening cannot assess joint involvement (psoriatic arthritis) or determine systemic treatment requirements.',
    clinicalCharacteristics: [
      'Sharply demarcated raised salmon-pink or erythematous plaques',
      'Thick, micaceous, silvery-white adherent scale',
      'Auspitz sign (pinpoint bleeding when scale is gently detached)',
      'Common on extensor surfaces (elbows, knees, scalp, lumbosacral spine)'
    ],
    recommendedNextSteps: [
      'Consult a dermatologist for a tailored treatment regimen (topical vitamin D/steroids, phototherapy, or biologics)',
      'Keep skin hydrated with intensive barrier emollients',
      'Avoid picking or peeling scale plaques to prevent Koebner phenomenon',
      'Report any joint stiffness, nail pitting, or swelling to your physician'
    ]
  },
  fungal: {
    code: 'fungal',
    shortCode: 'FUN',
    name: 'Fungal Infection (Tinea)',
    clinicalName: 'Dermatophytosis / Tinea Corporis / Ringworm',
    categoryType: 'Infectious/Inflammatory',
    riskLevel: 'benign-monitoring',
    description: 'A superficial cutaneous fungal infection of keratinized tissue caused by dermatophytes, presenting as an annular erythematous patch with active peripheral scaling.',
    whatItMeans: 'The AI model identified annular (ring-shaped) morphology with an active, raised scaly border and central clearing characteristic of tinea.',
    whatItDoesNotMean: 'Definitive confirmation requires potassium hydroxide (KOH) direct microscopy examination or fungal culture in a clinic.',
    clinicalCharacteristics: [
      'Annular (ring-shaped) erythematous patch or plaque',
      'Active, raised, scaly or vesicular advancing outer edge',
      'Partial central clearing or hyperpigmentation',
      'Mild to moderate localized pruritus'
    ],
    recommendedNextSteps: [
      'Consult a primary care doctor or dermatologist for diagnostic verification (e.g. KOH prep)',
      'Discuss appropriate topical or systemic antifungal medications (e.g. terbinafine, clotrimazole)',
      'Keep the affected anatomical area clean and dry',
      'Avoid sharing towels, clothing, or sports equipment to prevent transmission'
    ]
  },
  acne: {
    code: 'acne',
    shortCode: 'ACN',
    name: 'Acne Vulgaris',
    clinicalName: 'Acne Vulgaris (Papulopustular & Comedonal)',
    categoryType: 'Infectious/Inflammatory',
    riskLevel: 'benign-low',
    description: 'A common inflammatory disorder of the pilosebaceous unit characterized by open/closed comedones, erythematous papules, and pustules on sebum-rich areas.',
    whatItMeans: 'The AI model recognized follicular plugging (comedones) and localized inflammatory papules/pustules typical of acne.',
    whatItDoesNotMean: 'Does not identify specific hormonal, dietary, or follicular colonization drivers without clinical history.',
    clinicalCharacteristics: [
      'Comedones (blackheads and whiteheads)',
      'Inflammatory erythematous papules and pustules',
      'Common on face, chest, shoulders, and upper back',
      'Potential for post-inflammatory erythema or scarring'
    ],
    recommendedNextSteps: [
      'Use gentle non-comedogenic cleansers twice daily',
      'Inquire with a clinician about topical retinoids, benzoyl peroxide, or salicylic acid',
      'Avoid popping, picking, or squeezing lesions to prevent scarring and infection',
      'Consult a dermatologist for persistent nodulocystic lesions'
    ]
  },
  rosacea: {
    code: 'rosacea',
    shortCode: 'ROS',
    name: 'Rosacea',
    clinicalName: 'Erythematotelangiectatic / Papulopustular Rosacea',
    categoryType: 'Infectious/Inflammatory',
    riskLevel: 'benign-low',
    description: 'A chronic facial dermatosis characterized by persistent central facial erythema, visible telangiectasias, flushing episodes, and inflammatory papules.',
    whatItMeans: 'The AI model identified facial flushing, prominent centrofacial erythema, and telangiectatic vessels without typical acne comedones.',
    whatItDoesNotMean: 'Does not distinguish ocular rosacea manifestations or differentiate mild lupus erythematosus malar rash without clinical serology.',
    clinicalCharacteristics: [
      'Persistent centrofacial erythema (cheeks, nose, forehead, chin)',
      'Visible fine branching telangiectasias',
      'Episodes of facial flushing triggered by heat, spicy foods, or alcohol',
      'Stinging or burning sensation on facial skin'
    ],
    recommendedNextSteps: [
      'Identify and minimize personal environmental and dietary triggers',
      'Apply gentle mineral SPF 30+ sunscreen daily',
      'Use mild, soothing skincare without alcohol, fragrances, or harsh exfoliants',
      'Consult a dermatologist regarding topical ivermectin, metronidazole, or laser therapy'
    ]
  },
  urticaria: {
    code: 'urticaria',
    shortCode: 'URT',
    name: 'Urticaria (Hives)',
    clinicalName: 'Acute / Chronic Urticaria (Wheal Eruption)',
    categoryType: 'Infectious/Inflammatory',
    riskLevel: 'benign-monitoring',
    description: 'A transient cutaneous reaction characterized by erythematous, intensely pruritic edematous wheals that typically evolve and resolve within 24 hours.',
    whatItMeans: 'The AI model detected characteristic edematous wheals with central pallor and surrounding erythematous flare.',
    whatItDoesNotMean: 'This AI screening cannot identify specific IgE-mediated allergens or determine systemic anaphylaxis risk.',
    clinicalCharacteristics: [
      'Transient, raised, erythematous wheals with pale centers',
      'Intense pruritus (itching) and occasional burning sensation',
      'Individual lesions migrate or resolve within 24 hours',
      'May be accompanied by localized subcutaneous angioedema'
    ],
    recommendedNextSteps: [
      'EMERGENCY WARNING: Seek immediate emergency care if hives are accompanied by lip/tongue swelling, difficulty breathing, or dizziness',
      'Consult a physician regarding non-sedating H1 antihistamine therapy',
      'Avoid hot baths, tight clothing, and known allergen triggers',
      'Keep a symptom diary to identify potential dietary or contact causes'
    ]
  },
  contact_derm: {
    code: 'contact_derm',
    shortCode: 'CD',
    name: 'Contact Dermatitis',
    clinicalName: 'Allergic / Irritant Contact Dermatitis',
    categoryType: 'Infectious/Inflammatory',
    riskLevel: 'benign-monitoring',
    description: 'An inflammatory skin condition resulting from direct contact with an exogenous substance (either an irritant like harsh chemicals or an allergen like poison ivy or nickel).',
    whatItMeans: 'The AI model identified well-demarcated geometric or clustered erythematous vesicular eruption aligned with topical substance exposure.',
    whatItDoesNotMean: 'Does not replace clinical patch testing to pinpoint the exact culprit allergen.',
    clinicalCharacteristics: [
      'Erythematous rash confined to the area of substance contact',
      'Vesicles, weeping, or crusting in acute stages',
      'Dryness, scaling, and fissuring in chronic stages',
      'Marked pruritus or burning discomfort'
    ],
    recommendedNextSteps: [
      'Immediately wash the affected skin with mild soap and cool water to remove residual allergen/irritant',
      'Discontinue use of new cosmetics, topical products, jewelry, or cleaning chemicals',
      'Apply cool compresses and bland barrier creams',
      'Consult a dermatologist for patch testing if the trigger remains unknown'
    ]
  },
  herpes_zoster: {
    code: 'herpes_zoster',
    shortCode: 'HZ',
    name: 'Herpes Zoster (Shingles)',
    clinicalName: 'Herpes Zoster / Reactivated Varicella-Zoster Eruption',
    categoryType: 'Infectious/Inflammatory',
    riskLevel: 'benign-monitoring',
    description: 'A viral reactivation infection characterized by painful, grouped vesicles on an erythematous base distributed unilaterally along a specific dermatome.',
    whatItMeans: 'The AI model identified clustered vesicles on an erythematous base with unilateral dermatomal distribution typical of herpes zoster.',
    whatItDoesNotMean: 'Clinical evaluation is urgently required to initiate antiviral therapy within the critical 72-hour window.',
    clinicalCharacteristics: [
      'Unilateral dermatomal distribution (strictly respecting the midline)',
      'Grouped clear vesicles on an erythematous base evolving into crusts',
      'Localized neuropathic pain, tingling, hyperesthesia, or burning',
      'May be preceded by prodromal pain or malaise'
    ],
    recommendedNextSteps: [
      'URGENT: Consult a physician within 72 hours of rash onset to start antiviral therapy (e.g. valacyclovir)',
      'Keep the rash clean and covered with loose, non-stick sterile dressings',
      'Avoid contact with pregnant women, newborns, or immunocompromised individuals until crusting occurs',
      'Seek emergency evaluation immediately if the rash involves the eye, forehead, or tip of the nose (Hutchinson sign)'
    ]
  },
  normal_skin: {
    code: 'normal_skin',
    shortCode: 'NORM',
    name: 'Normal Healthy Skin',
    clinicalName: 'Healthy Cutaneous Integument (No Active Lesion Detected)',
    categoryType: 'Normal',
    riskLevel: 'benign-low',
    description: 'Unremarkable human skin surface with uniform texture, even pigment distribution, and absence of suspicious lesions, active rashes, or inflammatory cutaneous disease.',
    whatItMeans: 'The AI model examined the photographic field and found no signs of atypical melanocytic lesions, ulcerations, keratoses, or inflammatory rashes.',
    whatItDoesNotMean: 'This AI screening confirms only that the visible area in the photograph appears normal. It does not replace a comprehensive full-body skin check.',
    clinicalCharacteristics: [
      'Uniform epidermal texture and color tone',
      'Absence of atypical pigment networks, globules, or veils',
      'No erythema, scaling, pustules, wheals, or ulceration',
      'Intact skin barrier without visible abnormalities'
    ],
    recommendedNextSteps: [
      'Continue regular daily sun protection with broad-spectrum SPF 30+ sunscreen',
      'Perform monthly full-body skin self-examinations using the ABCDE guide',
      'Maintain skin barrier hydration with daily moisturizer',
      'If you notice any new or changing skin spot elsewhere, capture a clear photo and consult a dermatologist'
    ]
  },
  unwanted_non_skin: {
    code: 'unwanted_non_skin',
    shortCode: 'NON-SKIN',
    name: 'Non-Dermatological / Unwanted Image',
    clinicalName: 'Non-Skin / Ineligible Object Photograph',
    categoryType: 'Invalid',
    riskLevel: 'uncertain',
    description: 'The uploaded image does not contain a human skin surface, lesion, or dermatological area. Please upload a clear photograph of an infected, abnormal, or concerning skin area.',
    whatItMeans: 'The AI vision engine detected that this photo contains non-skin content (such as an animal, object, landscape, vehicle, food, or graphic document).',
    whatItDoesNotMean: 'No dermatological assessment could be performed on this image.',
    clinicalCharacteristics: [
      'Image content is non-dermatological',
      'No human cutaneous integument detected',
      'No skin lesions or rashes visible',
      'Not suitable for clinical screening'
    ],
    recommendedNextSteps: [
      'Please upload a close-up, focused photo of a human skin spot, mole, rash, or infected area',
      'Ensure good lighting and avoid blurry camera captures',
      'Part any hair covering the skin spot to enable accurate feature analysis',
      'Do not upload random objects, pets, or unrelated pictures'
    ]
  }
};

export const SAMPLE_DERMOSCOPY_CASES = [
  {
    id: 'DEMO-001',
    title: 'Atypical Pigmented Lesion (Left Shoulder)',
    categoryCode: 'nv',
    confidence: 0.88,
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
    description: 'Regular reticular pigment network on sun-exposed upper trunk, mild asymmetry.',
    riskLevel: 'benign-low' as const,
    date: '2026-08-16',
    status: 'Completed' as const,
    probabilities: [
      { categoryCode: 'nv', name: 'Melanocytic Nevus', clinicalName: 'Benign Melanocytic Nevus', probability: 0.88, percentage: 88, color: '#0d9488' },
      { categoryCode: 'bkl', name: 'Benign Keratosis', clinicalName: 'Seborrheic Keratosis', probability: 0.06, percentage: 6, color: '#64748b' },
      { categoryCode: 'mel', name: 'Melanoma (Suspected)', clinicalName: 'Malignant Melanoma', probability: 0.03, percentage: 3, color: '#ef4444' },
      { categoryCode: 'df', name: 'Dermatofibroma', clinicalName: 'Benign Dermatofibroma', probability: 0.02, percentage: 2, color: '#94a3b8' },
      { categoryCode: 'akiec', name: 'Actinic Keratosis', clinicalName: 'Actinic Keratosis', probability: 0.01, percentage: 1, color: '#f59e0b' }
    ]
  },
  {
    id: 'DEMO-002',
    title: 'Scaly Erythematous Plaque (Forehead)',
    categoryCode: 'akiec',
    confidence: 0.82,
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    description: 'Rough gritty erythematous patch with mild keratin scale on sun-damaged skin.',
    riskLevel: 'pre-malignant' as const,
    date: '2026-08-12',
    status: 'Requires Review' as const,
    probabilities: [
      { categoryCode: 'akiec', name: 'Actinic Keratosis', clinicalName: 'Actinic Keratosis / Bowen', probability: 0.82, percentage: 82, color: '#f59e0b' },
      { categoryCode: 'bcc', name: 'Basal Cell Carcinoma', clinicalName: 'Basal Cell Carcinoma', probability: 0.11, percentage: 11, color: '#ef4444' },
      { categoryCode: 'bkl', name: 'Benign Keratosis', clinicalName: 'Seborrheic Keratosis', probability: 0.04, percentage: 4, color: '#64748b' },
      { categoryCode: 'nv', name: 'Melanocytic Nevus', clinicalName: 'Melanocytic Nevus', probability: 0.03, percentage: 3, color: '#0d9488' }
    ]
  },
  {
    id: 'DEMO-003',
    title: 'Translucent Nodular Papule (Right Cheek)',
    categoryCode: 'bcc',
    confidence: 0.79,
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
    description: 'Pearly border with fine branching arborizing vessels and subtle central ulceration.',
    riskLevel: 'malignant-suspected' as const,
    date: '2026-08-08',
    status: 'Requires Review' as const,
    probabilities: [
      { categoryCode: 'bcc', name: 'Basal Cell Carcinoma', clinicalName: 'Basal Cell Carcinoma', probability: 0.79, percentage: 79, color: '#ef4444' },
      { categoryCode: 'akiec', name: 'Actinic Keratosis', clinicalName: 'Actinic Keratosis', probability: 0.12, percentage: 12, color: '#f59e0b' },
      { categoryCode: 'bkl', name: 'Benign Keratosis', clinicalName: 'Seborrheic Keratosis', probability: 0.06, percentage: 6, color: '#64748b' },
      { categoryCode: 'nv', name: 'Melanocytic Nevus', clinicalName: 'Melanocytic Nevus', probability: 0.03, percentage: 3, color: '#0d9488' }
    ]
  },
  {
    id: 'DEMO-004',
    title: 'Verrucous Stuck-on Plaque (Upper Back)',
    categoryCode: 'bkl',
    confidence: 0.94,
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
    description: 'Well-circumscribed warty dark brown plaque with visible comedo-like openings.',
    riskLevel: 'benign-low' as const,
    date: '2026-08-02',
    status: 'Completed' as const,
    probabilities: [
      { categoryCode: 'bkl', name: 'Benign Keratosis', clinicalName: 'Seborrheic Keratosis', probability: 0.94, percentage: 94, color: '#0d9488' },
      { categoryCode: 'nv', name: 'Melanocytic Nevus', clinicalName: 'Melanocytic Nevus', probability: 0.04, percentage: 4, color: '#64748b' },
      { categoryCode: 'mel', name: 'Melanoma (Suspected)', clinicalName: 'Malignant Melanoma', probability: 0.01, percentage: 1, color: '#ef4444' },
      { categoryCode: 'df', name: 'Dermatofibroma', clinicalName: 'Dermatofibroma', probability: 0.01, percentage: 1, color: '#94a3b8' }
    ]
  }
];

export const ABCDE_GUIDE = [
  {
    letter: 'A',
    name: 'Asymmetry',
    definition: 'One half of the mole or skin spot does not match the other half in shape or contour.',
    benignSign: 'Symmetric round or oval shape',
    warningSign: 'Irregular, non-mirroring halves'
  },
  {
    letter: 'B',
    name: 'Border',
    definition: 'The edges are irregular, notched, scalloped, jagged, or poorly defined.',
    benignSign: 'Smooth, sharp, distinct edge',
    warningSign: 'Blurred, ragged, fading border'
  },
  {
    letter: 'C',
    name: 'Color',
    definition: 'The color is not uniform across the lesion, showing multiple shades.',
    benignSign: 'Single even shade of brown or tan',
    warningSign: 'Variegated shades of brown, black, red, white, or blue'
  },
  {
    letter: 'D',
    name: 'Diameter',
    definition: 'The lesion is larger than 6 millimeters across (about the size of a pencil eraser).',
    benignSign: 'Under 6mm (stable)',
    warningSign: 'Over 6mm or actively expanding'
  },
  {
    letter: 'E',
    name: 'Evolution',
    definition: 'The mole is changing in size, shape, color, elevation, or developing symptoms like bleeding or itching.',
    benignSign: 'Remains unchanged over time',
    warningSign: 'Rapid change, itching, pain, bleeding, or crusting'
  }
];
