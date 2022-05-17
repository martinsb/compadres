import { useCallback, useContext, useEffect, useState, useRef } from "react";
import Automerge, { FreezeObject, BinaryDocument, BinaryChange } from "automerge";
import { v4 as uuidv4 } from "uuid";
import { TodoServiceContext } from "../context/TodoServiceContext";

import { Item, Project } from "compadres-common";

type Items = { items: Item[] };

type ImmutableProject = FreezeObject<Project>;

export default function useTodos(projectName: string) {
  const { service } = useContext(TodoServiceContext);

  const [doc, _setDoc] = useState<ImmutableProject | undefined>(undefined);
  const setDoc = useCallback((d: ImmutableProject | undefined) => {
    _setDoc(d);
  }, [_setDoc]);
  const addItem = useCallback(() => {
    setDoc(
      Automerge.change(doc, "Add new item", (doc) => {
        doc.items.push({
          id: uuidv4(),
          title: "",
          done: false,
        });
      })
    );
  }, [doc, setDoc]);
  const toggleCompletion = useCallback(
    (itemId: string) => {
      setDoc(
        Automerge.change(doc, "Toggle item completion status", (doc) => {
          const item = getItem(doc, itemId);
          item.done = !item.done;
        })
      );
    },
    [doc, setDoc]
  );
  const updateTitle = useCallback(
    (itemId: string, title: string) => {
      setDoc(
        Automerge.change(doc, "Update item title", (doc) => {
          const item = getItem(doc, itemId);
          item.title = title;
        })
      );
    },
    [doc, setDoc]
  );

  const savedProject = useRef<ImmutableProject | undefined>(undefined);

  const handleProjectData = useCallback(
    ({ name, data }: { name: string; data: number[] }) => {
      if (!data || name !== projectName) {
        return;
      }      const project = Automerge.load<Project>(
        Uint8Array.from(data) as BinaryDocument
      );
      savedProject.current = project;
      setDoc(project);
    },
    [setDoc, projectName]
  );

  const handleProjectChanges = useCallback(({name, changes}: {name: string; changes: number[][]}) => {
    if (name !== projectName || !savedProject.current) {
      return;
    }
    const binChanges = changes.map((c) => Uint8Array.from(c) as BinaryChange);
    const [nextDoc,] = Automerge.applyChanges(savedProject.current, binChanges);
    savedProject.current = nextDoc;
    setDoc(nextDoc);
  }, [setDoc, projectName]);

  useEffect(() => {
    service.on("project-data", handleProjectData);
    service.on("project-changes", handleProjectChanges);
    service.open(projectName);
    return () => {
      //This means that we cannot have two hooks responsible for the
      //same project, currently, we'll be closing a project for the
      //user globally.
      //TODO introduce some "counter" for each user in the server side
      service.off("project-changes", handleProjectChanges);
      service.off("project-data", handleProjectData);
      service.close(projectName);
    };
  }, [projectName, service, handleProjectData, handleProjectChanges]);

  useEffect(() => {
    if (!doc || !savedProject.current) {
      return;
    }
    //During initialization, when component is mounted twice in StrictMode,
    //`doc` is also initialized twice with the same data.
    //This causes RangeError when calling `Automerge.getChanges` which we can
    //ignore, therefore we put this in try..catch.
    try {
      const changes = Automerge.getChanges(savedProject.current, doc);
      if (changes.length) {
        service.sendChanges(
          projectName,
          changes
        );
      }
      savedProject.current = doc;
    } catch (e) {
      if (!(e instanceof RangeError)) {
        throw e;
      }
    }
  }, [doc, service, projectName]);

  return {
    items: doc?.items || [],
    add: addItem,
    toggle: toggleCompletion,
    updateTitle,
  };
}

const getItem = (doc: Items, itemId: string): Item => {
  const item = doc.items.find(({ id }) => id === itemId);
  if (!item) {
    throw new Error("Item not found");
  }
  return item;
};
