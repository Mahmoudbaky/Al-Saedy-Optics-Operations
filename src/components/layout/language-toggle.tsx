import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useI18n } from "@/lib/i18n"
import type { Language } from "@/types"

const LANGUAGES: Array<{ value: Language; label: string }> = [
  { value: "en", label: "EN" },
  { value: "ar", label: "العربية" },
]

/** EN / العربية switch. The pressed side wears the inverse (navy) surface. */
function LanguageToggle() {
  const { locale, setLocale } = useI18n()
  return (
    <ToggleGroup
      variant="outline"
      size="sm"
      spacing={0}
      value={[locale]}
      onValueChange={(value) => {
        const next = value[0] as Language | undefined
        if (next) setLocale(next)
      }}
      aria-label="Language"
      dir="ltr"
    >
      {LANGUAGES.map((lang) => (
        <ToggleGroupItem
          key={lang.value}
          value={lang.value}
          lang={lang.value}
          className="px-3 text-[13px] font-semibold text-muted-foreground aria-pressed:bg-secondary aria-pressed:text-secondary-foreground data-pressed:bg-secondary data-pressed:text-secondary-foreground"
        >
          {lang.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export { LanguageToggle }
