import logo from "@/assets/alianza-logo.jpg.asset.json";
import type { Certificate } from "@/types";

export function CertificateMockup({ certificate }: { certificate: Certificate }) {
  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl bg-white p-1.5 shadow-[var(--shadow-lift)]">
      <div className="relative overflow-hidden rounded-lg border-2 border-gold/40 navy-gradient px-6 py-10 text-center sm:px-14">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-gold/10 blur-2xl" />

        <img
          src={logo.url}
          alt="Alianza Contigo"
          width={72}
          height={72}
          loading="lazy"
          className="mx-auto h-16 w-16 rounded-lg object-cover object-[50%_38%]"
        />
        <p className="mt-4 text-[11px] tracking-[0.35em] text-gold">ALIANZA CONTIGO</p>
        <h3 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
          Certificado de aprobación
        </h3>
        <div className="mx-auto mt-4 gold-rule" />

        <p className="mt-6 text-sm text-white/60">Se otorga el presente certificado a</p>
        <p className="mt-2 font-display text-2xl font-semibold text-gradient-gold sm:text-3xl">
          {certificate.studentName}
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/70">
          por haber culminado y aprobado satisfactoriamente el programa de educación continua
        </p>
        <p className="mt-2 font-display text-lg font-semibold text-white">{certificate.courseName}</p>
        <p className="mt-3 text-xs tracking-wide text-gold">{certificate.endorsement}</p>

        <div className="mt-10 grid gap-6 text-left sm:grid-cols-3 sm:items-end">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Fecha</p>
            <p className="mt-1 text-sm text-white/85">{certificate.issuedAt}</p>
          </div>
          <div className="text-center">
            <p className="font-[cursive] text-lg text-white/90">Ma. Fernanda Salgado</p>
            <div className="mx-auto mt-1 h-px w-40 bg-gold/50" />
            <p className="mt-1 text-[10px] uppercase tracking-widest text-white/40">
              Dirección Académica
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] uppercase tracking-widest text-white/40">Código de verificación</p>
            <p className="mt-1 font-mono text-xs text-white/85">{certificate.code}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
