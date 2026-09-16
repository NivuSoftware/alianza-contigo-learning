import logo from "@/assets/logo_cert.png";
import type { Certificate } from "@/types";

export function CertificateMockup({ certificate }: { certificate: Certificate }) {
  return (
    <div className="certificate-sheet mx-auto w-full max-w-5xl overflow-hidden bg-[#f4f4f2] p-2.5 shadow-[var(--shadow-lift)]">
      <div className="relative min-h-[520px] overflow-hidden border-2 border-[#bd9345] bg-white px-5 py-7 text-center text-navy lg:aspect-[1.414/1] lg:min-h-0 lg:px-20 lg:py-9">
        <div className="pointer-events-none absolute inset-2 border border-navy/15" />

        <div className="pointer-events-none absolute left-2 top-2 h-16 w-24 bg-navy [clip-path:polygon(0_0,100%_0,0_100%)] lg:h-40 lg:w-56" />
        <div className="pointer-events-none absolute left-2 top-2 h-20 w-28 border-t-[5px] border-[#c79b48] [clip-path:polygon(0_0,100%_0,0_100%)] lg:h-44 lg:w-64" />
        <div className="pointer-events-none absolute bottom-2 right-2 h-16 w-24 rotate-180 bg-navy [clip-path:polygon(0_0,100%_0,0_100%)] lg:h-36 lg:w-52" />
        <div className="pointer-events-none absolute bottom-2 right-2 h-20 w-28 rotate-180 border-t-[5px] border-[#c79b48] [clip-path:polygon(0_0,100%_0,0_100%)] lg:h-40 lg:w-60" />

        <div className="relative mx-auto h-14 w-32 overflow-hidden lg:h-20 lg:w-48">
          <img
            src={logo}
            alt="Alianza Contigo"
            className="absolute left-0 top-[-38%] h-auto w-full max-w-none"
          />
        </div>
        <h3 className="relative mt-2 [font-family:Georgia,'Times_New_Roman',serif] text-2xl font-normal tracking-[0.12em] text-navy lg:text-5xl lg:tracking-[0.16em]">
          CERTIFICADO
        </h3>
        <p className="relative mt-1 text-[10px] font-semibold tracking-[0.5em] text-[#a87824] lg:text-sm">
          DE CULMINACIÓN
        </p>
        <div className="relative mx-auto mt-3 flex w-32 items-center gap-2 lg:w-44">
          <span className="h-px flex-1 bg-[#bd9345]" />
          <span className="h-1.5 w-1.5 rotate-45 border border-[#bd9345]" />
          <span className="h-px flex-1 bg-[#bd9345]" />
        </div>

        <p className="relative mt-5 text-xs tracking-wide text-slate-600 lg:mt-7 lg:text-sm">
          Se otorga el presente certificado a
        </p>
        <p className="relative mx-auto mt-2 max-w-4xl text-balance [font-family:Georgia,'Times_New_Roman',serif] text-xl italic leading-tight text-navy lg:text-5xl">
          {certificate.studentName}
        </p>
        <div className="relative mx-auto mt-3 h-px max-w-2xl bg-[#bd9345]/70" />
        <p className="relative mx-auto mt-4 max-w-xl text-xs leading-relaxed text-slate-600 lg:mt-5 lg:text-sm">
          por haber culminado y aprobado satisfactoriamente el curso de
        </p>
        <p className="relative mx-auto mt-2 max-w-2xl text-balance text-sm font-semibold uppercase tracking-[0.04em] text-navy lg:text-xl">
          {certificate.courseName}
        </p>
        {certificate.endorsement && (
          <p className="relative mt-2 text-[9px] tracking-wide text-slate-500 lg:text-xs">
            Con el aval de {certificate.endorsement}
          </p>
        )}

        <div className="relative z-10 mt-8 w-fit border-t border-[#bd9345]/55 pt-3 text-left lg:absolute lg:bottom-11 lg:left-20 lg:mt-0 lg:min-w-60">
          <p className="text-[8px] uppercase tracking-[0.2em] text-slate-500 lg:text-[10px]">
            Fecha de culminación
          </p>
          <p className="mt-1 text-[10px] font-medium text-navy lg:text-sm">
            {certificate.issuedAt}
          </p>
          <p className="mt-3 text-[8px] uppercase tracking-[0.2em] text-slate-500 lg:text-[10px]">
            Código de verificación
          </p>
          <p className="mt-1 font-mono text-[9px] font-medium tracking-wide text-navy lg:text-xs">
            {certificate.code}
          </p>
        </div>
      </div>
    </div>
  );
}
