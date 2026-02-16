import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { Person, DepartmentId } from '../types/activity';

export function usePeople(departmentId?: DepartmentId) {
  const [people, setPeople] = useState<Person[]>([]);

  const refresh = useCallback(async () => {
    try {
      let data = await api.people.list();
      if (departmentId) {
        data = data.filter((p) => p.departmentId === departmentId);
      }
      setPeople(data);
    } catch (err) {
      console.error('Failed to fetch people:', err);
    }
  }, [departmentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addPerson = useCallback(
    async (data: Omit<Person, 'id'>) => {
      const person = await api.people.create(data);
      await refresh();
      return person;
    },
    [refresh]
  );

  const updatePerson = useCallback(
    async (id: string, changes: Partial<Person>) => {
      await api.people.update(id, changes);
      await refresh();
    },
    [refresh]
  );

  const deletePerson = useCallback(
    async (id: string) => {
      await api.people.delete(id);
      await refresh();
    },
    [refresh]
  );

  return { people, addPerson, updatePerson, deletePerson, refresh };
}
