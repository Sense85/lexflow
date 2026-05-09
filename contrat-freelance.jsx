import { useState } from "react";

const SYSTEM_PROMPT = `Tu es un juriste expert en droit des contrats freelance belge avec 20 ans d'expérience. Tu rédiges des contrats de prestation de services professionnels, clairs, juridiquement solides et adaptés aux indépendants belges. Tes contrats sont conformes au Code civil belge et au droit belge des obligations. Ils sont équilibrés, protègent le freelance, et utilisent un langage juridique précis mais compréhensible. Tu inclus toujours les clauses essentielles : objet, durée, tarif HTVA avec TVA belge à 21%, modalités de paiement, propriété intellectuelle, confidentialité, résiliation, responsabilité, et tribunal compétent belge. Retourne UNIQUEMENT le texte du contrat, sans explication ni commentaire.`;

const MISSION_TYPES = ["Développement web", "Design graphique", "Rédaction / Copywriting", "Conseil / Consulting", "Marketing digital", "Photographie / Vidéo", "Autre"];
const PAYMENT_MODES = ["Virement bancaire", "PayPal", "Chèque", "Stripe"];
const FREE_LIMIT = 2;

export default function ContratFreelance() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    freelanceName: "", freelanceAddress: "", siret: "",
    clientName: "", clientAddress: "",
    missionType: "", missionDesc: "",
    amount: "", paymentMode: "", paymentDelay: "30",
    startDate: "", endDate: "",
    intellectualProperty: true, confidentiality: true,
  });
  const [contract, setContract] = useState("");
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [showPremium, setShowPremium] = useState(false);
  const [copied, setCopied] = useState(false);

  const isLocked = count >= FREE_LIMIT;

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function generate() {
    if (isLocked) { setShowPremium(true); return; }
    setLoading(true);
    setStep(4);

    const prompt = `Rédige un contrat de prestation de services freelance complet avec les informations suivantes :

PRESTATAIRE : ${form.freelanceName}, ${form.freelanceAddress}${form.siret ? `, BCE : ${form.siret}` : ""}
CLIENT : ${form.clientName}, ${form.clientAddress}
TYPE DE MISSION : ${form.missionType}
DESCRIPTION : ${form.missionDesc}
MONTANT : ${form.amount}€ HTVA (TVA belge 21% en sus)
MODE DE PAIEMENT : ${form.paymentMode}
DÉLAI DE PAIEMENT : ${form.paymentDelay} jours
DATE DE DÉBUT : ${form.startDate}
DATE DE FIN : ${form.endDate}
CESSION DE PROPRIÉTÉ INTELLECTUELLE : ${form.intellectualProperty ? "Oui, incluse" : "Non"}
CLAUSE DE CONFIDENTIALITÉ : ${form.confidentiality ? "Oui, incluse" : "Non"}

Rédige un contrat professionnel complet, avec tous les articles nécessaires, adapté au droit belge (Code civil belge).`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(i => i.text || "").join("") || "";
      setContract(text);
    } catch {
      setContract(`CONTRAT DE PRESTATION DE SERVICES\n\nEntre les soussignés :\n\n${form.freelanceName}, ci-après dénommé « le Prestataire »\net\n${form.clientName}, ci-après dénommé « le Client »\n\nIl a été convenu ce qui suit...\n\n[Erreur de génération — veuillez réessayer]`);
    }
    setCount(c => c + 1);
    setLoading(false);
  }

  function copy() {
    navigator.clipboard.writeText(contract);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() { setStep(1); setContract(""); setForm({ freelanceName: "", freelanceAddress: "", siret: "", clientName: "", clientAddress: "", missionType: "", missionDesc: "", amount: "", paymentMode: "", paymentDelay: "30", startDate: "", endDate: "", intellectualProperty: true, confidentiality: true }); }

  const steps = ["Parties", "Mission", "Conditions", "Contrat"];

  return (
    <div style={{ minHeight: "100vh", background: "#f7f4ef", fontFamily: "'Georgia', serif", color: "#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f7f4ef; }
        .label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #888; margin-bottom: 6px; display: block; }
        .input { width: 100%; background: white; border: 1px solid #d8d0c4; padding: 12px 14px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #1a1a1a; outline: none; transition: border-color 0.2s; border-radius: 0; }
        .input:focus { border-color: #1a1a1a; }
        .input::placeholder { color: #bbb; }
        .select { width: 100%; background: white; border: 1px solid #d8d0c4; padding: 12px 14px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #1a1a1a; outline: none; appearance: none; cursor: pointer; }
        .btn { font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; padding: 14px 28px; cursor: pointer; transition: all 0.15s; border: none; }
        .btn-dark { background: #1a1a1a; color: #f7f4ef; }
        .btn-dark:hover { background: #333; }
        .btn-outline { background: transparent; border: 1px solid #1a1a1a; color: #1a1a1a; }
        .btn-outline:hover { background: #1a1a1a; color: #f7f4ef; }
        .btn-gold { background: #c9a84c; color: white; }
        .btn-gold:hover { background: #b8963e; }
        .chip { font-family: 'IBM Plex Mono', monospace; font-size: 11px; padding: 8px 16px; border: 1px solid #d8d0c4; background: white; cursor: pointer; transition: all 0.15s; color: #666; }
        .chip:hover, .chip.on { background: #1a1a1a; color: white; border-color: #1a1a1a; }
        .toggle-wrap { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .toggle { width: 44px; height: 24px; background: #ddd; border-radius: 12px; position: relative; transition: background 0.2s; flex-shrink: 0; }
        .toggle.on { background: #1a1a1a; }
        .toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background: white; border-radius: 50%; transition: transform 0.2s; }
        .toggle.on::after { transform: translateX(20px); }
        .shimmer { background: linear-gradient(90deg, #ede8e0 25%, #e4ddd4 50%, #ede8e0 75%); background-size: 200% 100%; animation: sh 1.4s infinite; }
        @keyframes sh { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .fade { animation: fd 0.4s ease; }
        @keyframes fd { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .step-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'IBM Plex Mono', monospace; font-size: 11px; transition: all 0.2s; }
        .overlay { position: fixed; inset: 0; background: rgba(247,244,239,0.92); display: flex; align-items: center; justify-content: center; z-index: 50; backdrop-filter: blur(4px); }
        .modal { background: white; border: 1px solid #d8d0c4; padding: 48px; max-width: 440px; width: 90%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
        textarea { resize: vertical; min-height: 80px; }
        .contract-text { font-family: 'Libre Baskerville', serif; font-size: 13px; line-height: 1.9; color: #2a2a2a; white-space: pre-wrap; }
        .watermark { opacity: 0.06; font-family: 'Libre Baskerville', serif; font-size: 80px; font-weight: 700; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-30deg); pointer-events: none; white-space: nowrap; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#1a1a1a", padding: "0 40px", display: "flex", justifyContent: "space-between", alignItems: "center", height: "56px" }}>
        <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "16px", color: "#f7f4ef", letterSpacing: "0.02em" }}>
          Lex<span style={{ color: "#c9a84c" }}>flow</span>
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#666", letterSpacing: "0.12em" }}>
          {FREE_LIMIT - count} contrat(s) gratuit(s)
        </div>
      </div>

      {/* Steps indicator */}
      <div style={{ background: "white", borderBottom: "1px solid #e8e2d8", padding: "16px 40px" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", alignItems: "center", gap: "0" }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <div className="step-dot" style={{ background: step > i + 1 ? "#c9a84c" : step === i + 1 ? "#1a1a1a" : "#e8e2d8", color: step > i + 1 ? "white" : step === i + 1 ? "#f7f4ef" : "#aaa" }}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: step === i + 1 ? "#1a1a1a" : "#aaa", letterSpacing: "0.1em", textTransform: "uppercase" }}>{s}</span>
              </div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: "1px", background: step > i + 1 ? "#c9a84c" : "#e8e2d8", margin: "0 12px" }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "48px 24px" }}>

        {/* Step 1 — Parties */}
        {step === 1 && (
          <div className="fade">
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>Étape 1</div>
              <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "32px", fontWeight: 700, lineHeight: 1.2, marginBottom: "8px" }}>Les parties</h1>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", color: "#888", lineHeight: 1.7 }}>Identifiez le prestataire et le client.</p>
            </div>

            <div style={{ marginBottom: "32px", padding: "24px", background: "white", border: "1px solid #e8e2d8" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#c9a84c", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>Vous (le freelance)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div><span className="label">Nom complet / Raison sociale</span><input className="input" placeholder="Jean Dupont" value={form.freelanceName} onChange={e => update("freelanceName", e.target.value)} /></div>
                <div><span className="label">Adresse</span><input className="input" placeholder="Rue de la Loi 12, 1000 Bruxelles" value={form.freelanceAddress} onChange={e => update("freelanceAddress", e.target.value)} /></div>
                <div><span className="label">Numéro BCE (optionnel)</span><input className="input" placeholder="BE 0123.456.789" value={form.siret} onChange={e => update("siret", e.target.value)} /></div>
              </div>
            </div>

            <div style={{ marginBottom: "40px", padding: "24px", background: "white", border: "1px solid #e8e2d8" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#888", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>Votre client</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div><span className="label">Nom / Entreprise</span><input className="input" placeholder="Entreprise ABC" value={form.clientName} onChange={e => update("clientName", e.target.value)} /></div>
                <div><span className="label">Adresse</span><input className="input" placeholder="Avenue Louise 45, 1050 Bruxelles" value={form.clientAddress} onChange={e => update("clientAddress", e.target.value)} /></div>
              </div>
            </div>

            <button className="btn btn-dark" disabled={!form.freelanceName || !form.clientName} onClick={() => setStep(2)} style={{ opacity: (!form.freelanceName || !form.clientName) ? 0.4 : 1 }}>
              Continuer →
            </button>
          </div>
        )}

        {/* Step 2 — Mission */}
        {step === 2 && (
          <div className="fade">
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>Étape 2</div>
              <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "32px", fontWeight: 700, lineHeight: 1.2, marginBottom: "8px" }}>La mission</h1>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", color: "#888" }}>Décrivez la prestation.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "40px" }}>
              <div>
                <span className="label">Type de mission</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {MISSION_TYPES.map(t => <button key={t} className={`chip ${form.missionType === t ? "on" : ""}`} onClick={() => update("missionType", t)}>{t}</button>)}
                </div>
              </div>
              <div>
                <span className="label">Description détaillée</span>
                <textarea className="input" style={{ resize: "vertical", minHeight: "90px" }} placeholder="Ex: Création d'un site e-commerce sous WordPress avec intégration WooCommerce, 5 pages, responsive design..." value={form.missionDesc} onChange={e => update("missionDesc", e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}><span className="label">Date de début</span><input type="date" className="input" value={form.startDate} onChange={e => update("startDate", e.target.value)} /></div>
                <div style={{ flex: 1 }}><span className="label">Date de fin</span><input type="date" className="input" value={form.endDate} onChange={e => update("endDate", e.target.value)} /></div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-outline" onClick={() => setStep(1)}>← Retour</button>
              <button className="btn btn-dark" disabled={!form.missionType || !form.missionDesc} onClick={() => setStep(3)} style={{ opacity: (!form.missionType || !form.missionDesc) ? 0.4 : 1 }}>Continuer →</button>
            </div>
          </div>
        )}

        {/* Step 3 — Conditions */}
        {step === 3 && (
          <div className="fade">
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>Étape 3</div>
              <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "32px", fontWeight: 700, lineHeight: 1.2, marginBottom: "8px" }}>Les conditions</h1>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", color: "#888" }}>Tarif, paiement et clauses.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <span className="label">Montant total (€ HTVA)</span>
                  <input className="input" type="number" placeholder="2500" value={form.amount} onChange={e => update("amount", e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <span className="label">Délai de paiement (jours)</span>
                  <input className="input" type="number" placeholder="30" value={form.paymentDelay} onChange={e => update("paymentDelay", e.target.value)} />
                </div>
              </div>
              <div>
                <span className="label">Mode de paiement</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {PAYMENT_MODES.map(m => <button key={m} className={`chip ${form.paymentMode === m ? "on" : ""}`} onClick={() => update("paymentMode", m)}>{m}</button>)}
                </div>
              </div>

              <div style={{ padding: "20px", background: "white", border: "1px solid #e8e2d8", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#888", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>Clauses à inclure</div>
                <label className="toggle-wrap" onClick={() => update("intellectualProperty", !form.intellectualProperty)}>
                  <div className={`toggle ${form.intellectualProperty ? "on" : ""}`} />
                  <div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", color: "#1a1a1a" }}>Cession de propriété intellectuelle</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#aaa", marginTop: "2px" }}>Transfert des droits sur les livrables au client</div>
                  </div>
                </label>
                <label className="toggle-wrap" onClick={() => update("confidentiality", !form.confidentiality)}>
                  <div className={`toggle ${form.confidentiality ? "on" : ""}`} />
                  <div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", color: "#1a1a1a" }}>Clause de confidentialité</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#aaa", marginTop: "2px" }}>NDA intégré dans le contrat</div>
                  </div>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-outline" onClick={() => setStep(2)}>← Retour</button>
              <button className="btn btn-dark" disabled={!form.amount || !form.paymentMode} onClick={generate} style={{ opacity: (!form.amount || !form.paymentMode) ? 0.4 : 1 }}>
                ✦ Générer le contrat
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Contract */}
        {step === 4 && (
          <div className="fade">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>Contrat généré</div>
                <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "28px", fontWeight: 700 }}>Votre contrat</h1>
              </div>
              <button className="btn btn-outline" style={{ fontSize: "11px", padding: "10px 20px" }} onClick={reset}>Nouveau contrat</button>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[120, 80, 100, 60, 90, 70].map((h, i) => <div key={i} className="shimmer" style={{ height: `${h}px`, borderRadius: "2px" }} />)}
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#aaa", textAlign: "center", marginTop: "16px", letterSpacing: "0.1em" }}>
                  Rédaction en cours...
                </div>
              </div>
            ) : (
              <>
                <div style={{ background: "white", border: "1px solid #d8d0c4", padding: "40px", marginBottom: "24px", position: "relative", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                  <div className="watermark" style={{ color: "#1a1a1a" }}>LEXFLOW</div>
                  <div className="contract-text">{contract}</div>
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button className="btn btn-dark" onClick={copy}>
                    {copied ? "✓ Copié !" : "Copier le texte"}
                  </button>
                  <button className="btn btn-outline" onClick={() => { if (isLocked) { setShowPremium(true); } else { setStep(3); generate(); } }}>
                    Régénérer ↻
                  </button>
                  <button className="btn btn-gold" onClick={() => setShowPremium(true)}>
                    ✦ Télécharger en PDF
                  </button>
                </div>

                <div style={{ marginTop: "20px", padding: "14px 18px", background: "#fff9ec", border: "1px solid #f0d98a", fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#8a6d00", lineHeight: 1.6 }}>
                  ⚠ Ce contrat est généré par IA à titre indicatif. Pour les missions importantes, faites-le relire par un professionnel du droit.
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Premium Modal */}
      {showPremium && (
        <div className="overlay" onClick={() => setShowPremium(false)}>
          <div className="modal fade" onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "20px" }}>✦ Lexflow Pro</div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "28px", fontWeight: 700, marginBottom: "12px", lineHeight: 1.2 }}>
              Contrats <em>illimités</em>
            </div>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", color: "#888", lineHeight: 1.8, marginBottom: "28px" }}>
              Générez, téléchargez et gérez tous vos contrats freelance sans limite.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px", textAlign: "left" }}>
              {["Contrats illimités", "Export PDF professionnel", "Modèles personnalisés", "Signature électronique", "Historique des contrats", "Support juridique prioritaire"].map(f => (
                <div key={f} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#555", display: "flex", gap: "10px" }}>
                  <span style={{ color: "#c9a84c" }}>✦</span> {f}
                </div>
              ))}
            </div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "36px", fontWeight: 700, color: "#1a1a1a", marginBottom: "20px" }}>
              14,90€<span style={{ fontSize: "13px", color: "#aaa", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 300 }}>/mois</span>
            </div>
            <button className="btn btn-gold" style={{ width: "100%", marginBottom: "10px", fontSize: "13px" }}>Commencer maintenant →</button>
            <button className="btn btn-outline" style={{ width: "100%", fontSize: "11px" }} onClick={() => window.open("VOTRE_LIEN_STRIPE")}>Plus tard</button>
          </div>
        </div>
      )}
    </div>
  );
}
