import { DEFAULT_CONSTANTS } from '../../utils/constants.ts'
import type { DatasetConstants } from '../../types.ts'

type SettingsFormProps = {
  constants: DatasetConstants
  onChange: (constants: DatasetConstants) => void
  onReset: () => void
}

const NumberInput = ({
  id,
  label,
  value,
  onChange,
  step = '1',
  helper,
}: {
  id: string
  label: string
  value: number
  step?: string
  helper?: string
  onChange: (value: number) => void
}) => (
  <label className="flex flex-col gap-1 text-sm text-slate-300">
    <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
    <input
      id={id}
      type="number"
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100"
    />
    {helper ? <span className="text-xs text-slate-500">{helper}</span> : null}
  </label>
)

export const SettingsForm = ({ constants, onChange, onReset }: SettingsFormProps) => {
  const handleConstantChange = (field: keyof DatasetConstants, value: number) => {
    onChange({
      ...constants,
      [field]: value,
    })
  }

  const handleMissionPointsChange = (field: 'fiveK' | 'eightK' | 'tenK', value: number) => {
    onChange({
      ...constants,
      stepMissionPts: {
        ...constants.stepMissionPts,
        [field]: value,
      },
    })
  }

  return (
    <form className="space-y-6" aria-label="Settings form">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          id="stepsPerKmFoot"
          label="Steps per km (foot)"
          value={constants.stepsPerKmFoot}
          onChange={(value) => handleConstantChange('stepsPerKmFoot', value)}
          step="10"
          helper="Assumed steps per 1 km of walking"
        />
        <NumberInput
          id="ptsPerKmRunWalk"
          label="Points per km (run/walk)"
          value={constants.ptsPerKmRunWalk}
          onChange={(value) => handleConstantChange('ptsPerKmRunWalk', value)}
          helper="Payout per km recorded as foot activity"
        />
        <NumberInput
          id="ptsPerKmBike"
          label="Points per km (bike)"
          value={constants.ptsPerKmBike}
          onChange={(value) => handleConstantChange('ptsPerKmBike', value)}
          helper="Payout per km recorded as bike"
        />
        <NumberInput
          id="ptsPer10kStepsBaseline"
          label="Baseline pts per 10k steps"
          value={constants.ptsPer10kStepsBaseline}
          onChange={(value) => handleConstantChange('ptsPer10kStepsBaseline', value)}
          helper="Passive points applied to every 10k steps"
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
        <h4 className="text-sm font-semibold text-slate-200">Step mission points</h4>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <NumberInput
            id="stepMissionFiveK"
            label="5k mission"
            value={constants.stepMissionPts.fiveK}
            onChange={(value) => handleMissionPointsChange('fiveK', value)}
          />
          <NumberInput
            id="stepMissionEightK"
            label="8k mission"
            value={constants.stepMissionPts.eightK}
            onChange={(value) => handleMissionPointsChange('eightK', value)}
          />
          <NumberInput
            id="stepMissionTenK"
            label="10k mission"
            value={constants.stepMissionPts.tenK}
            onChange={(value) => handleMissionPointsChange('tenK', value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10" onClick={onReset}>
          Reset to defaults
        </button>
        <span className="rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-xs text-slate-400">
          Current defaults: {JSON.stringify(DEFAULT_CONSTANTS)}
        </span>
      </div>
    </form>
  )
}

