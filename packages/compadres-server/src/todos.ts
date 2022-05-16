import {Item, Project} from "compadres-common";

const TODOS: {[key: string]: Project} = {
  todo1: {
    name: "Groceries",
    items: [
      {
        id: "1",
        title: "Canned beans",
        done: false,
      },
      {
        id: "2",
        title: "Carrots",
        done: true,
      },
      {
        id: "3",
        title: "Zucchini",
        done: false,
      },
    ],
  },
  todo2: {
    name: "Daily routine",
    items: [
      {
        id: "4",
        title: "Brush teeth",
        done: true,
      },
      {
        id: "5",
        title: "Exercise",
        done: false,
      },
      {
        id: "6",
        title: "Walk outsite",
        done: true,
      },
      {
        id: "7",
        title: "Have breakfast",
        done: false,
      },
    ],
  },
};

export class TodoService {
  async listProjects(): Promise<string[]> {
    return Promise.resolve(Object.keys(TODOS));
  }

  async listItems(projectName: string): Promise<Item[]> {
    if (!(projectName in TODOS)) {
      throw new Error(`Project ${projectName} does not exist`);
    }
    return TODOS[projectName].items;
  }
}
