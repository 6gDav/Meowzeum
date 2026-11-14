import type { PasswordField, Tab } from "#/routes/pages/auth"

export const styles = {
  input: 'w-full rounded-xl border border-[#d97706]/30 bg-[#fdf6e2]/40 px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none transition-all duration-200 focus:border-[#d97706] focus:bg-white focus:ring-4 focus:ring-[#d97706]/15',
  label: 'block text-sm font-semibold text-[#b45309] mb-1.5',
  error: 'mt-1 text-xs font-medium text-red-600 min-h-[1rem]',
}

export interface ComponetsFormProps {
  visible: Record<PasswordField, boolean>
  toggleVisible: (field: PasswordField) => void
  switchTab: (tab: Tab) => void
}