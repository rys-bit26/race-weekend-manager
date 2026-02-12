import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { generateId } from '../utils/id';
import type { Person, DepartmentId } from '../types/activity';

export function usePeople(departmentId?: DepartmentId) {
  const people = useLiveQuery(
    () => {
      if (departmentId) {
        return db.people.where('departmentId').equals(departmentId).toArray();
      }
      return db.people.toArray();
    },
    [departmentId],
    []
  );

  const addPerson = async (data: Omit<Person, 'id'>) => {
    const person: Person = { ...data, id: generateId() };
    await db.people.add(person);
    return person;
  };

  const updatePerson = async (id: string, changes: Partial<Person>) => {
    await db.people.update(id, changes);
  };

  const deletePerson = async (id: string) => {
    await db.people.delete(id);
  };

  return { people, addPerson, updatePerson, deletePerson };
}
