const capitalize = (word = '') => word[0].toUpperCase() + word.slice(1)

interface Props {
  label: string
  name: string
  inputs: Record<string, string | number | readonly string[] | undefined>
}

export default function FormItem({ label, name, inputs, ...props }: Props) {
  return (
    <label htmlFor={name}>
      {label || capitalize(name)}
      <input name={name} type="text" value={inputs[name]} {...props} />
    </label>
  )
}
