import type * as React from 'react';

type Node = React.ReactNode;
/** Lucide icon id, e.g. 'sparkles', 'file-spreadsheet', 'arrow-up-right'. */
export type IconName = string;
export type Tone = 'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger' | 'ia' | 'outline' | 'muted';
export type ChartColor = 'chart-1' | 'chart-2' | 'chart-3';
export interface MenuItem { label?: string; icon?: IconName; onSelect?: () => void; variant?: 'danger' | 'ia' | 'export'; disabled?: boolean; hint?: string; separator?: boolean; heading?: string }
export interface Crumb { label: string; href?: string }
export interface NavEntry { group?: string; id?: string; label?: string; icon?: IconName; short?: string; count?: number; countLabel?: string }
export interface User { name: string; role?: string; email?: string }

/* Helpers */
export declare function formatBRL(value: number, opts?: { signed?: boolean }): string;
export declare function formatNumber(value: number): string;
export declare function formatPercent(value: number, digits?: number): string;
export declare function titleCase(name: string): string;
export declare function initials(name: string): string;
export declare function useViewport(): { width: number; bucket: 'sm' | 'md' | 'lg' | 'xl'; compact: boolean };
export declare const ICON_NAMES: string[];
export declare const NAV: NavEntry[];

/* Navegação */
export interface AppShellProps { active?: string; onNavigate?: (id: string) => void; crumbs?: Crumb[]; title?: string; back?: { label?: string; onClick?: () => void }; onNewAudit?: () => void; defaultCollapsed?: boolean; nav?: NavEntry[]; user?: User; children?: Node }
export declare function AppShell(props: AppShellProps): React.ReactElement;
export interface SidebarProps { nav?: NavEntry[]; active?: string; onNavigate?: (id: string) => void; onNewAudit?: () => void }
export declare function Sidebar(props: SidebarProps): React.ReactElement;
export interface TopbarProps { crumbs?: Crumb[]; title?: string; back?: { label?: string; onClick?: () => void }; user?: User }
export declare function Topbar(props: TopbarProps): React.ReactElement;
export interface BottomNavProps { nav?: NavEntry[]; active?: string; onNavigate?: (id: string) => void; onNewAudit?: () => void }
export declare function BottomNav(props: BottomNavProps): React.ReactElement;
export interface PageHeaderProps { eyebrow?: Node; title: Node; subtitle?: Node; meta?: Node; badge?: Node; primary?: Node; secondary?: MenuItem[]; extra?: Node }
export declare function PageHeader(props: PageHeaderProps): React.ReactElement;
export interface TabsProps { tabs: { id: string; label: Node; icon?: IconName; count?: number; disabled?: boolean }[]; value?: string; defaultValue?: string; onChange?: (id: string) => void; fill?: boolean; label?: string }
export declare function Tabs(props: TabsProps): React.ReactElement;

/* Ações */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost' | 'ia' | 'export' | 'light' | 'deep' | 'link'; size?: 'sm' | 'md' | 'lg'; icon?: IconName; iconEnd?: IconName; loading?: boolean; block?: boolean }
export declare function Button(props: ButtonProps): React.ReactElement;
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { icon: IconName; label: string; variant?: 'ghost' | 'secondary' | 'primary'; size?: 'sm' | 'md'; round?: boolean; loading?: boolean }
export declare function IconButton(props: IconButtonProps): React.ReactElement;
export interface ActionMenuProps { items: MenuItem[]; label?: string; title?: string; trigger?: (props: Record<string, unknown>) => Node; align?: 'left' | 'right'; defaultOpen?: boolean; header?: Node; autoFocus?: boolean }
export declare function ActionMenu(props: ActionMenuProps): React.ReactElement;

/* Filtros e campos */
export interface FilterChipsProps { options: { id: string; label: Node; icon?: IconName; count?: number; disabled?: boolean }[]; value?: string | string[]; defaultValue?: string | string[]; onChange?: (v: string | string[]) => void; multiple?: boolean; scroll?: boolean; label?: string }
export declare function FilterChips(props: FilterChipsProps): React.ReactElement;
export declare function SelectChip(props: { label?: Node; value: Node; icon?: IconName } & React.ButtonHTMLAttributes<HTMLButtonElement>): React.ReactElement;
export interface SegmentedControlProps { options: { id: string; label: Node; icon?: IconName }[]; value?: string; defaultValue?: string; onChange?: (id: string) => void; label?: string; block?: boolean }
export declare function SegmentedControl(props: SegmentedControlProps): React.ReactElement;
export interface FieldProps { label?: Node; optional?: boolean; help?: Node; error?: Node; id?: string; className?: string }
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> { prefix?: Node; prefixIcon?: IconName; suffix?: Node; suffixIcon?: IconName; size?: 'sm' | 'md'; pill?: boolean; numeric?: boolean }
export type TextFieldProps = FieldProps & InputProps;
export declare function TextField(props: TextFieldProps): React.ReactElement;
export declare function MaskedField(props: TextFieldProps & { mask?: 'cnpj' | 'cpf' | 'phone'; onChange?: (masked: string) => void }): React.ReactElement;
export declare function CurrencyField(props: Omit<TextFieldProps, 'value' | 'defaultValue' | 'onChange'> & { value?: number; defaultValue?: number; onChange?: (reais: number) => void }): React.ReactElement;
export interface SearchFieldProps { placeholder?: string; value?: string; defaultValue?: string; onChange?: (v: string) => void; label?: string; size?: 'sm' | 'md'; pill?: boolean; shortcut?: string }
export declare function SearchField(props: SearchFieldProps): React.ReactElement;
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> { options: { value: string; label: string }[]; size?: 'sm' | 'md'; pill?: boolean; prefixIcon?: IconName }
export declare function Select(props: SelectProps): React.ReactElement;
export declare function SelectField(props: FieldProps & SelectProps): React.ReactElement;
export declare function Checkbox(props: { label: Node; description?: Node } & React.InputHTMLAttributes<HTMLInputElement>): React.ReactElement;
export declare function Switch(props: { label: Node; description?: Node } & React.InputHTMLAttributes<HTMLInputElement>): React.ReactElement;

/* Indicadores */
export interface DeltaProps { value: Node; direction?: 'up' | 'down'; good?: boolean; label?: string }
export interface HeroKpiProps { label: string; value: Node; icon?: IconName; meta?: Node; chip?: Node; actions?: Node; topAction?: Node }
export declare function HeroKpi(props: HeroKpiProps): React.ReactElement;
export declare function HeroChip(props: { icon?: IconName; children?: Node }): React.ReactElement;
export interface KpiCardProps { label: Node; value: Node; icon?: IconName; tone?: 'danger' | 'success' | 'warning' | 'accent' | 'ia'; delta?: DeltaProps; hint?: Node; variant?: 'tile' | 'card' }
export declare function KpiCard(props: KpiCardProps): React.ReactElement;
export declare function KpiGroup(props: { columns?: number; children?: Node }): React.ReactElement;
export interface StatStripProps { items: { label: Node; value: Node; sub?: Node; icon?: IconName; tone?: KpiCardProps['tone'] }[]; compact?: boolean }
export declare function StatStrip(props: StatStripProps): React.ReactElement;
export interface SegmentedMeterProps { value: number; secondary?: number; segments?: number; title?: Node; valueLabel?: string; legend?: { label: Node; swatch: ChartColor | 'track' | 'hatch' | 'success'; value?: Node }[]; height?: number; thin?: boolean; label?: string }
export declare function SegmentedMeter(props: SegmentedMeterProps): React.ReactElement;
export interface ProgressBarProps { value?: number; max?: number; label?: string; valueLabel?: string; tone?: 'accent' | 'success' | 'warning' | 'danger'; size?: 'sm' | 'md'; indeterminate?: boolean }
export declare function ProgressBar(props: ProgressBarProps): React.ReactElement;

/* Dados */
export interface CardProps extends React.HTMLAttributes<HTMLElement> { title?: Node; subtitle?: Node; icon?: IconName; actions?: Node; footer?: Node; flush?: boolean; inset?: boolean; glow?: boolean; headingLevel?: 2 | 3 | 4 }
export declare function Card(props: CardProps): React.ReactElement;
export interface Column<R> { key: string; header: Node; align?: 'left' | 'right' | 'center'; sortable?: boolean; sortValue?: (row: R) => string | number; render?: (row: R) => Node; priority?: 1 | 2 | 3; width?: number | string }
export interface DataTableProps<R = any> { columns: Column<R>[]; rows: R[]; rowKey?: (row: R) => string; mobile?: { title: (row: R) => Node; value?: (row: R) => Node; meta?: (row: R) => Node; tags?: (row: R) => Node }; primaryAction?: (row: R) => { label: string; icon?: IconName; iconEnd?: IconName; onClick?: () => void; ariaLabel?: string }; rowActions?: (row: R) => MenuItem[]; onRowClick?: (row: R) => void; selectedKey?: string | null; loading?: boolean; skeletonRows?: number; empty?: Node; footer?: Node; caption?: string; forceMode?: 'table' | 'cards'; defaultSort?: { key: string; dir: 'asc' | 'desc' } | null; openActionsFor?: string }
export declare function DataTable<R>(props: DataTableProps<R>): React.ReactElement;
export declare function Pagination(props: { page?: number; pageSize?: number; total?: number; onPage?: (p: number) => void; onPageSize?: (n: number) => void; compact?: boolean }): React.ReactElement;
export interface BadgeProps { tone?: Tone; icon?: IconName; size?: 'sm' | 'md'; title?: string; children?: Node }
export declare function Badge(props: BadgeProps): React.ReactElement;
export declare function Count(props: { children?: Node; tone?: 'accent' | 'danger'; label?: string }): React.ReactElement;
export declare function ResultBadge(props: { divergences: number; size?: 'sm' | 'md' }): React.ReactElement;
export declare function ProfileBadge(props: { profile: 'admin' | 'auditor' | 'gestor' }): React.ReactElement;
export interface StatusBadgeProps { status: 'pendente' | 'revisado' | 'corrigido' | 'conforme' | 'divergente' | 'ativo' | 'senha-pendente' | 'desativado' | 'processando' | 'erro'; size?: 'sm' | 'md'; children?: Node }
export declare function StatusBadge(props: StatusBadgeProps): React.ReactElement;
export interface DirectionTagProps { direction: 'rep' | 'prod'; short?: boolean; plain?: boolean; children?: Node }
export declare function DirectionTag(props: DirectionTagProps): React.ReactElement;
export declare function DiffValue(props: { value: number; short?: boolean }): React.ReactElement;
export interface AvatarProps { name: string; src?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; off?: boolean }
export declare function Avatar(props: AvatarProps): React.ReactElement;
export interface RankingListProps { items: { id?: string; name: string; meta?: Node; value: number }[]; formatValue?: (v: number) => string; onSelect?: (item: any) => void; nameFormat?: (s: string) => string }
export declare function RankingList(props: RankingListProps): React.ReactElement;

/* Gráficos */
export interface BarChartProps { data: { label: string; values: number[]; partial?: boolean }[]; series: { name: string; color: ChartColor }[]; height?: number; view?: 'chart' | 'table'; formatValue?: (v: number) => string; caption?: string; partialLabel?: string; totalLabel?: string; integer?: boolean }
export declare function BarChart(props: BarChartProps): React.ReactElement;
export interface DonutChartProps { parts: { label: string; value: number; color: ChartColor; icon?: IconName; sub?: Node }[]; size?: number; thickness?: number; centerLabel?: string; formatValue?: (v: number) => string }
export declare function DonutChart(props: DonutChartProps): React.ReactElement;
export declare function Legend(props: { items: { label: Node; swatch: ChartColor | 'track' | 'hatch' | 'success'; value?: Node }[] }): React.ReactElement;

/* Upload */
export interface DropzoneProps { step?: number; title: string; subtitle?: string; state?: 'empty' | 'dragover' | 'loaded' | 'error' | 'uploading'; file?: { name: string; size?: number; rows?: number; columns?: string[] }; error?: string; onFile?: (f: File) => void; onRemove?: () => void; accept?: string; hint?: string }
export declare function Dropzone(props: DropzoneProps): React.ReactElement;
export declare function UploadProgress(props: { done?: number; total?: number }): React.ReactElement;
export interface AccordionProps { items: { id: string; title: Node; subtitle?: Node; icon?: IconName; content: Node }[]; defaultOpen?: string[]; multiple?: boolean }
export declare function Accordion(props: AccordionProps): React.ReactElement;

/* Sobreposições */
export interface DrawerProps { open?: boolean; onClose?: () => void; eyebrow?: Node; title: Node; subtitle?: Node; headerExtra?: Node; footer?: Node; children?: Node; autoFocus?: boolean }
export declare function Drawer(props: DrawerProps): React.ReactElement | null;
export interface BottomSheetProps { open?: boolean; onClose?: () => void; title: Node; footer?: Node; children?: Node; autoFocus?: boolean }
export declare function BottomSheet(props: BottomSheetProps): React.ReactElement | null;
export interface ModalProps { open?: boolean; onClose?: () => void; title: Node; description?: Node; icon?: IconName; tone?: 'default' | 'danger' | 'ia'; footer?: Node; size?: 'md' | 'wide'; dismissible?: boolean; autoFocus?: boolean; children?: Node }
export declare function Modal(props: ModalProps): React.ReactElement | null;
export interface AiProgressModalProps { open?: boolean; steps: { label: string; state: 'done' | 'active' | 'pending'; end?: Node }[]; progress?: number; onBackground?: () => void; onCancel?: () => void; title?: string; description?: string; autoFocus?: boolean }
export declare function AiProgressModal(props: AiProgressModalProps): React.ReactElement | null;
export interface ConfirmDialogProps { open?: boolean; onClose?: () => void; onConfirm?: () => void; title?: Node; description?: Node; confirmLabel?: string; loading?: boolean; autoFocus?: boolean; children?: Node }
export declare function ConfirmDialog(props: ConfirmDialogProps): React.ReactElement | null;

/* Feedback */
export interface ToastProps { tone?: 'success' | 'error' | 'warning' | 'info' | 'ia'; title?: Node; children?: Node; action?: { label: string; onClick?: () => void }; onClose?: () => void }
export declare function Toast(props: ToastProps): React.ReactElement;
export declare function ToastStack(props: { children?: Node; inline?: boolean }): React.ReactElement;
export interface CalloutProps { tone?: 'info' | 'success' | 'warning' | 'danger' | 'ia' | 'neutral'; title?: Node; children?: Node; icon?: IconName; action?: Node }
export declare function Callout(props: CalloutProps): React.ReactElement;
export interface EmptyStateProps { icon?: IconName; title: Node; children?: Node; actions?: Node; tone?: 'default' | 'error'; compact?: boolean }
export declare function EmptyState(props: EmptyStateProps): React.ReactElement;
export declare function ErrorState(props: { title?: Node; children?: Node; onRetry?: () => void; icon?: IconName; compact?: boolean }): React.ReactElement;
export interface IconProps { name: IconName; size?: number; label?: string; className?: string; strokeWidth?: number }
export declare function Icon(props: IconProps): React.ReactElement;

/* Estrutura de página */
export declare function ActionBar(props: { message?: Node; icon?: IconName; children?: Node }): React.ReactElement;
export declare function SettingsSection(props: { title: Node; description?: Node; children?: Node }): React.ReactElement;

declare global { interface Window { ConSaude: typeof import('./index') & { screens: Record<string, React.ComponentType<any>>; demo: Record<string, unknown> } } }
