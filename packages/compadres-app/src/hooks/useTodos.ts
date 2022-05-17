import { useCallback, useContext, useEffect, useState } from "react";
import Automerge, { FreezeObject, BinaryDocument } from "automerge";
import { v4 as uuidv4 } from "uuid";
import { TodoServiceContext } from "../context/TodoServiceContext";

import { Item, Project } from "compadres-common";
import usePrevious from "./usePrevious";

type Items = { items: Item[] };

type ImmutableProject = FreezeObject<Project>;

export default function useTodos(projectName: string) {
  const { service } = useContext(TodoServiceContext);

  const [doc, setDoc] = useState<ImmutableProject | undefined>(undefined);
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

  const handleProjectData = useCallback(
    ({ name, data }: { name: string; data: number[] }) => {
      if (!data || name !== projectName) {
        return;
      }
      const project = Automerge.load<Project>(
        Uint8Array.from(data) as BinaryDocument
      );
      setDoc(project);
    },
    [setDoc, projectName]
  );

  useEffect(() => {
    service.on("project-data", handleProjectData);
    service.open(projectName);
    return () => {
      //This means that we cannot have two hooks responsible for the
      //same project, currently, we'll be closing a project for the
      //user globally.
      //TODO introduce some "counter" for each user in the server side
      service.off("project-data", handleProjectData);
      service.close(projectName);
    };
  }, [projectName, handleProjectData, service]);

  const prevDoc = usePrevious<ImmutableProject | undefined>(doc);
  useEffect(() => {
    if (!prevDoc || !doc) {
      return;
    }
    //During initialization, when component is mounted twice in StrictMode,
    //`doc` is also initialized twice with the same data.
    //This causes RangeError when calling `Automerge.getChanges` which we can
    //ignore, therefore we put this in try..catch.
    try {
      const changes = Automerge.getChanges(prevDoc, doc);
      service.sendChanges(
        projectName,
        changes.map((c) => Array.from(c))
      );
    } catch (e) {
      if (!(e instanceof RangeError)) {
        throw e;
      }
    }
  }, [doc, prevDoc, service, projectName]);

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
