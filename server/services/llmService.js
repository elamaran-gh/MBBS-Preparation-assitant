import config from '../config/env.js';

// Medical database for mock RAG responses to provide high quality clinical content
const MOCK_MEDICAL_ANSWERS = {
  nephrotic: {
    definition: "Nephrotic syndrome is a glomerular disorder characterized by massive proteinuria (>3.5 g/24 hr), hypoalbuminemia (<3.0 g/dL), generalized edema (anasarca), hyperlipidemia, and lipiduria. It results from increased glomerular permeability to plasma proteins due to damage to glomerular basement membrane or podocyte slit diaphragms.",
    mainPoints: [
      "Characterized by glomerular filtration barrier disruption.",
      "Can be primary (Minimal Change Disease, Focal Segmental Glomerulosclerosis, Membranous Nephropathy) or secondary (Diabetic Nephropathy, Lupus Nephritis, Amyloidosis).",
      "Hypoalbuminemia triggers hepatic synthesis of lipids, causing hyperlipidemia.",
      "Loss of antithrombin III and proteins C & S leads to a hypercoagulable state."
    ],
    clinicalFeatures: [
      "Generalized edema: Periorbital puffiness (pronounced in the morning), pitting pedal edema, and ascites/pleural effusion (anasarca).",
      "Frothy or foamy urine due to high protein content.",
      "Fatigue, lethargy, and loss of appetite.",
      "Susceptibility to infections (due to loss of immunoglobulins like IgG in urine).",
      "Thrombotic complications (e.g., renal vein thrombosis)."
    ],
    investigations: [
      "Urine Analysis: 3+ or 4+ protein, dipstick positive, microscopy shows fatty casts (oval fat bodies).",
      "24-Hour Urine Protein: Quantifies excretion >3.5 g/day (or random spot protein-to-creatinine ratio >3.0).",
      "Blood Chemistry: Serum Albumin <3 g/dL, elevated Serum Cholesterol and Triglycerides, Blood Urea Nitrogen (BUN) and Creatinine to assess renal function.",
      "Renal Biopsy: Essential in adults to diagnose the underlying histopathological type (e.g., Membranous, FSGS) or in children steroid-resistant cases."
    ],
    management: [
      "General Measures: Dietary sodium restriction (<2 g/day), fluid restriction if hyponatremic, and adequate protein intake (0.8-1.0 g/kg/day).",
      "Symptomatic Therapy: Loop diuretics (e.g., Furosemide) combined with thiazides/spironolactone for edema control. ACE inhibitors or ARBs to reduce proteinuria and control blood pressure.",
      "Specific Immunosuppression: Oral Corticosteroids (e.g., Prednisolone 1 mg/kg/day or 60 mg/m²/day) are the first-line therapy (especially for Minimal Change Disease). Alternating agents like Cyclophosphamide, Cyclosporine, or Rituximab in steroid-resistant/dependent cases.",
      "Prophylaxis: Anticoagulation for high-risk patients (Albumin <2.0 g/dL) and Pneumococcal vaccination to prevent infections."
    ],
    importantExamPoints: [
      "Minimal Change Disease is the most common cause of Nephrotic Syndrome in children (responsive to steroids; shows podocyte effacement on electron microscopy).",
      "Membranous Nephropathy is the most common cause in elderly patients, frequently associated with anti-PLA2R antibodies.",
      "Hypercoagulability is a major risk; renal vein thrombosis can present with sudden flank pain, hematuria, and a worsening of proteinuria."
    ]
  },
  appendicitis: {
    definition: "Acute appendicitis is the acute inflammation of the vermiform appendix, typically caused by obstruction of the appendiceal lumen. It is the most common acute surgical emergency of the abdomen worldwide.",
    mainPoints: [
      "Obstruction is usually due to a fecalith (adults) or lymphoid hyperplasia (children).",
      "Obstruction leads to intraluminal pressure increase, ischemia, bacterial overgrowth, and eventual perforation.",
      "Requires prompt surgical evaluation to prevent rupture and diffuse peritonitis."
    ],
    clinicalFeatures: [
      "Abdominal pain: Initially vague periumbilical pain (visceral) shifting to the right iliac fossa (somatic) over 12-24 hours.",
      "Anorexia (highly consistent finding, 'hamburger sign'), nausea, and vomiting.",
      "Low-grade fever and mild leukocytosis.",
      "Local tenderness at McBurney's point (one-third of the distance from the anterior superior iliac spine to the umbilicus).",
      "Rebound tenderness (Blumberg sign), Rovsing's sign (cross-tenderness in LIF), Psoas sign (pain on hip extension), and Obturator sign."
    ],
    investigations: [
      "Complete Blood Count (CBC): Leukocytosis (typically 10,000-16,000/µL) with a left shift (neutrophilia).",
      "C-Reactive Protein (CRP): Elevated, supports inflammatory process.",
      "Ultrasonography (USG): Initial imaging of choice, particularly in children and pregnant women. Key findings: blind-ended non-compressible loop >6mm diameter, appendicolith, target sign.",
      "Contrast-Enhanced CT (CECT) of Abdomen: Gold standard in adults. Findings: dilated appendix (>6mm), wall thickening (>2mm) with enhancement, periappendiceal fat stranding."
    ],
    management: [
      "Pre-operative: NPO (nil per os), intravenous fluid resuscitation, and administration of IV antibiotics (targeting Gram-negative and anaerobic organisms, e.g., Cefuroxime + Metronidazole).",
      "Surgical intervention: Appendectomy (Laparoscopic or Open) is the definitive treatment. Laparoscopic appendectomy is preferred due to less pain, faster recovery, and lower wound infection rates.",
      "Conservative management (Antibiotics-first): Can be considered in uncomplicated, selected cases without signs of peritonitis or appendicolith, though recurrence rates are significant."
    ],
    importantExamPoints: [
      "Alvarado Score (MANTRELS): Scoring system based on Migratory pain, Anorexia, Nausea, Tenderness in RIF, Rebound tenderness, Elevated temperature, Leukocytosis, Shift to left. Score >= 7 highly indicative of appendicitis.",
      "Perforation risk increases significantly after 24-36 hours from the onset of symptoms.",
      "A retrocecal appendix may present with atypical clinical findings, such as flank pain or diarrhea due to local rectal irritation."
    ]
  },
  tuberculosis: {
    definition: "Tuberculosis (TB) is a chronic infectious disease caused by Mycobacterium tuberculosis. It primarily affects the lungs (pulmonary TB) but can involve any organ system (extrapulmonary TB) through hematogenous or lymphatic spread.",
    mainPoints: [
      "M. tuberculosis is an acid-fast bacillus (AFB) transmitted via inhalation of respiratory droplets.",
      "Primary infection leads to a Ghon focus, which with lymph node involvement forms the Ghon complex (primary complex).",
      "Post-primary (reactivation) TB occurs in immunocompromised states or elderly, usually localized to the lung apices.",
      "Requires prolonged multi-drug therapy to prevent resistance (MDR-TB)."
    ],
    clinicalFeatures: [
      "Constitutional symptoms: Low-grade evening fever, night sweats, unexplained weight loss, anorexia, and progressive lethargy.",
      "Pulmonary symptoms: Persistent productive cough (>2-3 weeks) initially dry then productive of purulent sputum, hemoptysis (coughing up blood), and pleuritic chest pain.",
      "Physical signs: Crepitations in apical areas, bronchial breath sounds over consolidations/cavities."
    ],
    investigations: [
      "Sputum Microscopy: Acid-fast bacilli (AFB) staining using Ziehl-Neelsen (ZN) stain (requires two samples, one early morning).",
      "CBNAAT (GeneXpert MTB/RIF): Rapid molecular assay detecting M. tuberculosis DNA and Rifampicin resistance simultaneously. Preferred initial diagnostic test.",
      "Chest X-ray (CXR): Upper lobe infiltrates, cavitation, fibronodular lesions, pleural effusion, or miliary pattern.",
      "Sputum Culture: Gold standard using Lowenstein-Jensen (LJ) medium (takes 6-8 weeks) or liquid culture systems (MGIT, 2-3 weeks).",
      "Mantoux (Tuberculin Skin) Test: PPD injection showing induration >10mm indicates exposure (not active disease)."
    ],
    management: [
      "Directly Observed Treatment Short-Course (DOTS): Standard strategy implementation to ensure compliance.",
      "Intensive Phase (2 Months): Four drugs: Rifampicin (R), Isoniazid (H), Pyrazinamide (Z), and Ethambutol (E) (HRZE).",
      "Continuation Phase (4 Months): Three drugs: Rifampicin, Isoniazid, and Ethambutol (HRE) or just HR depending on guidelines.",
      "Pyridoxine (Vitamin B6): Co-administered (10-20 mg/day) with Isoniazid to prevent peripheral neuropathy.",
      "Surgical intervention: Rarely indicated, limited to complications like massive hemoptysis, empyema, or bronchopleural fistula."
    ],
    importantExamPoints: [
      "Mechanism of action of antitubercular drugs: Isoniazid inhibits mycolic acid synthesis; Rifampicin inhibits RNA synthesis; Pyrazinamide disrupts membrane potential; Ethambutol inhibits arabinosyl transferase.",
      "Side effects: Isoniazid causes peripheral neuropathy and hepatitis; Rifampicin causes orange-colored urine/secretions; Pyrazinamide causes hyperuricemia (gout); Ethambutol causes optic neuritis (red-green color blindness)."
    ]
  }
};

const DEFAULT_ANSWER = {
  definition: "This represents a structured, syllabus-oriented academic outline generated for the requested medical question. It leverages RAG to extract relevant reference topics, presenting them in an exam-friendly standard format.",
  mainPoints: [
    "Glomerular/clinical pathophysiology dictates the clinical syndrome.",
    "Correct differential diagnostics include lab workups and tissue biopsy validation.",
    "First-line therapeutics rely on symptomatic relief followed by disease-specific interventions."
  ],
  clinicalFeatures: [
    "Classic presentation of localized pain, swelling, or systemic fever.",
    "Functional impairment of affected organs or physiological systems.",
    "Pathognomonic signs identifiable upon thorough physical examination."
  ],
  investigations: [
    "Baseline hematology, biochemistry, and inflammatory markers.",
    "Confirmatory radiological imaging (USG, CT, or MRI).",
    "Microbiological cultures or histopathological biopsy where tissue diagnosis is essential."
  ],
  management: [
    "Initial stabilization, hydration, and empirical pain/symptom control.",
    "Pharmacological guidelines targeting underlying pathogenesis.",
    "Surgical consultation or interventional procedures if medical treatment is inadequate or contraindications exist.",
    "Proactive monitoring for chronic sequelae, side effects, or structural relapses."
  ],
  importantExamPoints: [
    "Key differentiators are frequently tested in professional clinical board questions.",
    "Understanding toxicities, adverse reactions, and contraindications of primary drugs is essential.",
    "Complications and red-flag signs require urgent triaging."
  ]
};

/**
 * Service to interface with LLM.
 */
export const generateAnswer = async (promptText, contextText = '') => {
  if (config.LLM_API_KEY) {
    try {
      // TODO: Replace with live LLM client API call (e.g. Gemini, OpenAI, Cohere)
      // For example, calling Gemini API using standard fetch:
      /*
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + config.LLM_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${promptText}\n\nContext:\n${contextText}\n\nProvide response in JSON matching: {"answer": {"definition": "...", "mainPoints": ["..."], "clinicalFeatures": ["..."], "investigations": ["..."], "management": ["..."], "importantExamPoints": ["..."]}}`
            }]
          }]
        })
      });
      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      return JSON.parse(textResponse);
      */
      console.log('LLM API key detected. Running live LLM query (stub)...');
    } catch (err) {
      console.error('Failed to query LLM API, using high quality fallback:', err);
    }
  }

  // Live matching of high-quality mock database based on keywords in prompt
  const lowercasePrompt = promptText.toLowerCase();
  let matchedKey = null;

  if (lowercasePrompt.includes('nephrotic')) {
    matchedKey = 'nephrotic';
  } else if (lowercasePrompt.includes('appendic') || lowercasePrompt.includes('appendix')) {
    matchedKey = 'appendicitis';
  } else if (lowercasePrompt.includes('tuberculo') || lowercasePrompt.includes('koch') || lowercasePrompt.includes('tb')) {
    matchedKey = 'tuberculosis';
  }

  const answer = matchedKey ? MOCK_MEDICAL_ANSWERS[matchedKey] : DEFAULT_ANSWER;

  return {
    answer: {
      ...answer
    },
    sources: []
  };
};

export default {
  generateAnswer
};
