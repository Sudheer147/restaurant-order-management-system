type IconProps = {
  className?: string;
  [key: string]: any;
};

const icon = (symbol: string) => (props: IconProps) => (
  <span {...props}>{symbol}</span>
);

export const Receipt = icon('🧾');
export const CreditCard = icon('💳');
export const IndianRupee = icon('₹');
export const Smartphone = icon('📱');
export const CheckCircle = icon('✅');
export const CheckCircle2 = icon('✔️');
export const AlertCircle = icon('⚠️');
export const XCircle = icon('❌');
export const HelpCircle = icon('❔');
export const FileCode = icon('📄');
export const GitBranch = icon('🌿');
export const Terminal = icon('💻');
export const Cpu = icon('🖥️');
export const ShieldCheck = icon('🛡️');
export const Info = icon('ℹ️');
export const BookOpen = icon('📖');
export const Database = icon('🗄️');
export const Workflow = icon('🔄');
export const GitMerge = icon('🌐');
export const ShieldAlert = icon('🚨');
export const Layers = icon('📚');
export const Server = icon('🖧');
export const Code = icon('💻');
export const Check = icon('✔️');
export const UtensilsCrossed = icon('🍽️');
export const Volume2 = icon('🔊');
export const ChefHat = icon('👨‍🍳');
export const Sparkles = icon('✨');
export const ShoppingBag = icon('🛍️');
export const Users = icon('👥');
export const Trophy = icon('🏆');
export const Activity = icon('⚡');
export const Printer = icon('🖨️');
export const UsersIcon = icon('👤');
export const Plus = icon('+');
export const Minus = icon('−');
export const Trash2 = icon('🗑️');
export const Search = icon('🔎');
export const Utensils = icon('🍴');
export const AlertTriangle = icon('⚠️');
export const Clock = icon('⏱️');
export const Flame = icon('🔥');
export const Leaf = icon('🍃');
