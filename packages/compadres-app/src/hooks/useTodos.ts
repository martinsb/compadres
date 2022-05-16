import { useCallback, useContext, useEffect, useState } from "react";
import Automerge, { FreezeObject } from "automerge";
import { v4 as uuidv4 } from "uuid";
import { TodoServiceContext } from "../context/TodoServiceContext";
import TodoService from "../service/todoService";

import { Item, Project } from "compadres-common";

const initialItems: Item[] = [
  // {
  //   id: uuidv4(),
  //   title: "Feed the dog",
  //   done: true,
  // },
  // {
  //   id: uuidv4(),
  //   title: "Grocery shopping",
  //   done: false,
  // },
  // {
  //   id: uuidv4(),
  //   title: "Brush my teeth",
  //   done: true,
  // },
];

type Document = FreezeObject<{ items: Item[] }>;

export default function useTodos(projectName: string) {
  const {service} = useContext(TodoServiceContext);

  const [doc, setDoc] = useState<Document>(
    Automerge.from({ items: initialItems })
  );
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

  const handleProjectItems = useCallback((project: Project) => {
    setDoc(Automerge.from({items: project.items}));
  }, [setDoc]);

  useEffect(() => {
    service.open(projectName);
    service.on("project-items", handleProjectItems);
    return () => {
      service.off("project-items", handleProjectItems);
      //This means that we cannot have two hooks responsible for the
      //same project.
      //TODO introduce some "counter" for each user in the server side
      service.close(projectName);
    }
  }, [projectName]);

  return {
    items: doc.items,
    add: addItem,
    toggle: toggleCompletion,
    updateTitle,
  };
}

const getItem = (doc: Document, itemId: string): Item => {
  const item = doc.items.find(({ id }) => id === itemId);
  if (!item) {
    throw new Error("Item not found");
  }
  return item;
};
