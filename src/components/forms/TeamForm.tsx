import { useEffect, useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import type { Member, TeamInput } from '../../types.ts'

type TeamFormProps = {
  teams: TeamInput[]
  onChange: (teams: TeamInput[]) => void
}

const emptyTeam: TeamInput = {
  name: '',
  steps: 0,
  activityKm: 0,
  missions: 0,
  quizzes: 0,
  photos: 0,
  teamPoints: undefined,
  boostActiveCount: undefined,
}

const parseMemberLines = (value: string): Member[] => {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, points] = line.split(':')
      return {
        name: name?.trim() ?? '',
        points: Number(points?.trim() ?? 0),
      }
    })
    .filter((member) => member.name.length > 0)
}

const formatMemberLines = (members?: Member[]): string => {
  if (!members || members.length === 0) return ''
  return members.map((member) => `${member.name}: ${member.points}`).join('\n')
}

const InputColumn = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-2">{children}</div>
)

export const TeamForm = ({ teams, onChange }: TeamFormProps) => {
  const [localTeams, setLocalTeams] = useState<TeamInput[]>(() => (teams.length === 0 ? [emptyTeam] : teams))
  const [activeMembersIndex, setActiveMembersIndex] = useState<number | null>(null)
  const [memberText, setMemberText] = useState('')

  useEffect(() => {
    setLocalTeams(teams.length === 0 ? [emptyTeam] : teams)
  }, [teams])

  useEffect(() => {
    if (activeMembersIndex === null) return
    setMemberText(formatMemberLines(localTeams[activeMembersIndex]?.members))
  }, [activeMembersIndex, localTeams])

  const updateTeam = (index: number, partial: Partial<TeamInput>) => {
    const next = localTeams.map((team, idx) => (idx === index ? { ...team, ...partial } : team))
    setLocalTeams(next)
    onChange(next)
  }

  const handleAddTeam = () => {
    const next = [...localTeams, { ...emptyTeam }]
    setLocalTeams(next)
    onChange(next)
  }

  const handleRemoveTeam = (index: number) => {
    const next = localTeams.filter((_, idx) => idx !== index)
    setLocalTeams(next.length === 0 ? [emptyTeam] : next)
    onChange(next)
  }

  const handleMembersSave = () => {
    if (activeMembersIndex === null) return
    const members = parseMemberLines(memberText)
    updateTeam(activeMembersIndex, { members })
    setActiveMembersIndex(null)
  }

  return (
    <form className="space-y-6" aria-label="Teams editor">
      {localTeams.map((team, index) => (
        <fieldset key={index} className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
          <legend className="text-lg font-semibold text-white">Team {index + 1}</legend>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InputColumn>
              <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor={`name-${index}`}>
                Team name
              </label>
              <input
                id={`name-${index}`}
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus-visible:ring-emerald-400"
                placeholder="Les Sportifs"
                value={team.name}
                onChange={(event) => updateTeam(index, { name: event.target.value })}
              />
            </InputColumn>
            <InputColumn>
              <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor={`steps-${index}`}>
                Steps
              </label>
              <input
                id={`steps-${index}`}
                type="number"
                min="0"
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={team.steps}
                onChange={(event) => updateTeam(index, { steps: Number(event.target.value) })}
              />
            </InputColumn>
            <InputColumn>
              <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor={`activityKm-${index}`}>
                Activity km
              </label>
              <input
                id={`activityKm-${index}`}
                type="number"
                min="0"
                step="0.01"
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={team.activityKm}
                onChange={(event) => updateTeam(index, { activityKm: Number(event.target.value) })}
              />
            </InputColumn>
            <InputColumn>
              <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor={`missions-${index}`}>
                Missions
              </label>
              <input
                id={`missions-${index}`}
                type="number"
                min="0"
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={team.missions}
                onChange={(event) => updateTeam(index, { missions: Number(event.target.value) })}
              />
            </InputColumn>
            <InputColumn>
              <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor={`quizzes-${index}`}>
                Quizzes
              </label>
              <input
                id={`quizzes-${index}`}
                type="number"
                min="0"
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={team.quizzes}
                onChange={(event) => updateTeam(index, { quizzes: Number(event.target.value) })}
              />
            </InputColumn>
            <InputColumn>
              <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor={`photos-${index}`}>
                Photos
              </label>
              <input
                id={`photos-${index}`}
                type="number"
                min="0"
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={team.photos}
                onChange={(event) => updateTeam(index, { photos: Number(event.target.value) })}
              />
            </InputColumn>
            <InputColumn>
              <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor={`teamPoints-${index}`}>
                Team points (optional)
              </label>
              <input
                id={`teamPoints-${index}`}
                type="number"
                min="0"
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={team.teamPoints ?? ''}
                onChange={(event) => updateTeam(index, { teamPoints: event.target.value === '' ? undefined : Number(event.target.value) })}
              />
            </InputColumn>
            <InputColumn>
              <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor={`boost-${index}`}>
                Active boosts (optional)
              </label>
              <input
                id={`boost-${index}`}
                type="number"
                min="0"
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                value={team.boostActiveCount ?? ''}
                onChange={(event) => updateTeam(index, { boostActiveCount: event.target.value === '' ? undefined : Number(event.target.value) })}
              />
            </InputColumn>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs uppercase tracking-wide text-emerald-200 transition hover:bg-emerald-500/20"
              onClick={() => setActiveMembersIndex(index)}
            >
              Edit members
            </button>
            {localTeams.length > 1 ? (
              <button
                type="button"
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs uppercase tracking-wide text-rose-200 transition hover:bg-rose-500/20"
                onClick={() => handleRemoveTeam(index)}
              >
                Remove
              </button>
            ) : null}
          </div>

          {activeMembersIndex === index ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/80 p-4">
              <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor={`members-${index}`}>
                Members (name:points per line)
              </label>
              <textarea
                id={`members-${index}`}
                className="mt-2 h-32 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                value={memberText}
                onChange={(event) => setMemberText(event.target.value)}
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs uppercase tracking-wide text-emerald-200"
                  onClick={handleMembersSave}
                >
                  Save members
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs uppercase tracking-wide text-slate-300"
                  onClick={() => setActiveMembersIndex(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </fieldset>
      ))}

      <div className="flex justify-end">
        <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-500/20" onClick={handleAddTeam}>
          <PlusIcon className="h-4 w-4" aria-hidden />
          Add team
        </button>
      </div>
    </form>
  )
}

