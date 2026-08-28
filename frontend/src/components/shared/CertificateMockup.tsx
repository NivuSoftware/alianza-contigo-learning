import logo from "@/assets/logo_cert.png";
import type { Certificate } from "@/types";

export function CertificateMockup({ certificate }: { certificate: Certificate }) {
  return (
    <div className="certificate-sheet mx-auto w-full max-w-5xl overflow-hidden bg-[#f4f4f2] p-2.5 shadow-[var(--shadow-lift)]">
      <div className="relative aspect-[1.414/1] overflow-hidden border-2 border-[#bd9345] bg-white px-8 py-7 text-center text-navy sm:px-20 sm:py-9">
        <div className="pointer-events-none absolute inset-2 border border-navy/15" />

        <div className="pointer-events-none absolute left-2 top-2 h-28 w-40 bg-navy [clip-path:polygon(0_0,100%_0,0_100%)] sm:h-40 sm:w-56" />
        <div className="pointer-events-none absolute left-2 top-2 h-32 w-48 border-t-[5px] border-[#c79b48] [clip-path:polygon(0_0,100%_0,0_100%)] sm:h-44 sm:w-64" />
        <div className="pointer-events-none absolute bottom-2 right-2 h-24 w-36 rotate-180 bg-navy [clip-path:polygon(0_0,100%_0,0_100%)] sm:h-36 sm:w-52" />
        <div className="pointer-events-none absolute bottom-2 right-2 h-28 w-44 rotate-180 border-t-[5px] border-[#c79b48] [clip-path:polygon(0_0,100%_0,0_100%)] sm:h-40 sm:w-60" />

        <div className="relative mx-auto h-14 w-32 overflow-hidden sm:h-20 sm:w-48">
          <img
            src={logo}
            alt="Alianza Contigo"
            className="absolute left-0 top-[-38%] h-auto w-full max-w-none"
          />
        </div>
        <h3 className="relative mt-2 [font-family:Georgia,'Times_New_Roman',serif] text-3xl font-normal tracking-[0.16em] text-navy sm:text-5xl">
          CERTIFICADO
        </h3>
        <p className="relative mt-1 text-[10px] font-semibold tracking-[0.5em] text-[#a87824] sm:text-sm">
          DE CULMINACIÓN
        </p>
        <div className="relative mx-auto mt-3 flex w-32 items-center gap-2 sm:w-44">
          <span className="h-px flex-1 bg-[#bd9345]" />
          <span className="h-1.5 w-1.5 rotate-45 border border-[#bd9345]" />
          <span className="h-px flex-1 bg-[#bd9345]" />
        </div>

        <p className="relative mt-5 text-[11px] tracking-wide text-slate-600 sm:mt-7 sm:text-sm">
          Se otorga el presente certificado a
        </p>
        <p className="relative mx-auto mt-2 max-w-4xl text-balance [font-family:Georgia,'Times_New_Roman',serif] text-2xl italic leading-tight text-navy sm:text-5xl">
          {certificate.studentName}
        </p>
        <div className="relative mx-auto mt-3 h-px max-w-2xl bg-[#bd9345]/70" />
        <p className="relative mx-auto mt-4 max-w-xl text-[10px] leading-relaxed text-slate-600 sm:mt-5 sm:text-sm">
          por haber culminado y aprobado satisfactoriamente el curso de
        </p>
        <p className="relative mx-auto mt-2 max-w-2xl text-balance text-sm font-semibold uppercase tracking-[0.04em] text-navy sm:text-xl">
          {certificate.courseName}
        </p>
        {certificate.endorsement && (
          <p className="relative mt-2 text-[9px] tracking-wide text-slate-500 sm:text-xs">
            Con el aval de {certificate.endorsement}
          </p>
        )}

        <div className="absolute bottom-7 left-8 border-t border-[#bd9345]/55 pt-3 text-left sm:bottom-11 sm:left-20 sm:min-w-60">
          <p className="text-[8px] uppercase tracking-[0.2em] text-slate-500 sm:text-[10px]">
            Fecha de culminación
          </p>
          <p className="mt-1 text-[10px] font-medium text-navy sm:text-sm">
            {certificate.issuedAt}
          </p>
          <p className="mt-3 text-[8px] uppercase tracking-[0.2em] text-slate-500 sm:text-[10px]">
            Código de verificación
          </p>
          <p className="mt-1 font-mono text-[9px] font-medium tracking-wide text-navy sm:text-xs">
            {certificate.code}
          </p>
        </div>
      </div>
    </div>
  );
}
