import { useCallback, useEffect, useState } from 'react'
import type { Cari, Company, Database, HistoryEntry, Project, Stage } from './types'
import { stageMeta } from './types'
import { loadDb, nowISO, saveDb, uid } from './storage'

export interface NewCariInput {
  firstName: string
  lastName: string
  phone: string
  infoStatus: string
  stage?: Stage
}

export function useStore() {
  const [db, setDb] = useState<Database>(() => loadDb())

  useEffect(() => {
    saveDb(db)
  }, [db])

  // --- Şirketler ---
  const addCompany = useCallback((name: string): Company => {
    const company: Company = { id: uid(), name: name.trim(), createdAt: nowISO() }
    setDb((prev) => ({ ...prev, companies: [...prev.companies, company] }))
    return company
  }, [])

  const renameCompany = useCallback((id: string, name: string) => {
    setDb((prev) => ({
      ...prev,
      companies: prev.companies.map((c) => (c.id === id ? { ...c, name: name.trim() } : c)),
    }))
  }, [])

  const deleteCompany = useCallback((id: string) => {
    setDb((prev) => {
      const projectIds = prev.projects.filter((p) => p.companyId === id).map((p) => p.id)
      return {
        companies: prev.companies.filter((c) => c.id !== id),
        projects: prev.projects.filter((p) => p.companyId !== id),
        cariler: prev.cariler.filter((k) => !projectIds.includes(k.projectId)),
      }
    })
  }, [])

  // --- Projeler ---
  const addProject = useCallback((companyId: string, name: string): Project => {
    const project: Project = {
      id: uid(),
      companyId,
      name: name.trim(),
      createdAt: nowISO(),
    }
    setDb((prev) => ({ ...prev, projects: [...prev.projects, project] }))
    return project
  }, [])

  const renameProject = useCallback((id: string, name: string) => {
    setDb((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)),
    }))
  }, [])

  const deleteProject = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
      cariler: prev.cariler.filter((k) => k.projectId !== id),
    }))
  }, [])

  // --- Cariler ---
  const addCari = useCallback((projectId: string, input: NewCariInput): Cari => {
    const ts = nowISO()
    const stage = input.stage ?? 'eklendi'
    const history: HistoryEntry[] = [
      {
        id: uid(),
        type: 'created',
        message: `Cari oluşturuldu${input.infoStatus ? ` — Bilgi durumu: ${input.infoStatus}` : ''}`,
        toStage: stage,
        createdAt: ts,
      },
    ]
    const cari: Cari = {
      id: uid(),
      projectId,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.trim(),
      infoStatus: input.infoStatus.trim(),
      stage,
      createdAt: ts,
      updatedAt: ts,
      history,
    }
    setDb((prev) => ({ ...prev, cariler: [...prev.cariler, cari] }))
    return cari
  }, [])

  const updateCariDetails = useCallback(
    (id: string, patch: Pick<NewCariInput, 'firstName' | 'lastName' | 'phone' | 'infoStatus'>) => {
      setDb((prev) => ({
        ...prev,
        cariler: prev.cariler.map((k) => {
          if (k.id !== id) return k
          const ts = nowISO()
          const infoChanged = patch.infoStatus.trim() !== k.infoStatus
          const entry: HistoryEntry = {
            id: uid(),
            type: infoChanged ? 'info_update' : 'edit',
            message: infoChanged
              ? `Bilgi durumu güncellendi: "${patch.infoStatus.trim() || '—'}"`
              : 'Cari bilgileri güncellendi',
            createdAt: ts,
          }
          return {
            ...k,
            firstName: patch.firstName.trim(),
            lastName: patch.lastName.trim(),
            phone: patch.phone.trim(),
            infoStatus: patch.infoStatus.trim(),
            updatedAt: ts,
            history: [...k.history, entry],
          }
        }),
      }))
    },
    [],
  )

  const setCariStage = useCallback((id: string, toStage: Stage) => {
    setDb((prev) => ({
      ...prev,
      cariler: prev.cariler.map((k) => {
        if (k.id !== id || k.stage === toStage) return k
        const ts = nowISO()
        const entry: HistoryEntry = {
          id: uid(),
          type: 'stage_change',
          message: `Aşama "${stageMeta(k.stage).label}" → "${stageMeta(toStage).label}" olarak güncellendi`,
          fromStage: k.stage,
          toStage,
          createdAt: ts,
        }
        return { ...k, stage: toStage, updatedAt: ts, history: [...k.history, entry] }
      }),
    }))
  }, [])

  const addNote = useCallback((id: string, note: string) => {
    const text = note.trim()
    if (!text) return
    setDb((prev) => ({
      ...prev,
      cariler: prev.cariler.map((k) => {
        if (k.id !== id) return k
        const ts = nowISO()
        const entry: HistoryEntry = {
          id: uid(),
          type: 'note',
          message: text,
          createdAt: ts,
        }
        return { ...k, updatedAt: ts, history: [...k.history, entry] }
      }),
    }))
  }, [])

  const deleteCari = useCallback((id: string) => {
    setDb((prev) => ({ ...prev, cariler: prev.cariler.filter((k) => k.id !== id) }))
  }, [])

  return {
    db,
    addCompany,
    renameCompany,
    deleteCompany,
    addProject,
    renameProject,
    deleteProject,
    addCari,
    updateCariDetails,
    setCariStage,
    addNote,
    deleteCari,
  }
}

export type Store = ReturnType<typeof useStore>
