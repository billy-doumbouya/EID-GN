export function FormField({ label, required, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-offwhite-100/80">
          {label} {required && <span className="text-mechanic-400">*</span>}
        </label>
        {hint && (
          <span className="text-[11px] text-offwhite-100/40">{hint}</span>
        )}
      </div>
      {children}
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
}
