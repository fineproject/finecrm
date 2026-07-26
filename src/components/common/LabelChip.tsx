import Chip from '@mui/material/Chip'

type MuiColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'

/** Enum etiketleri için tek tip, küçük renkli rozet. */
export default function LabelChip({
  label,
  color = 'default',
}: {
  label: string
  color?: MuiColor
}) {
  return <Chip label={label} color={color} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
}
