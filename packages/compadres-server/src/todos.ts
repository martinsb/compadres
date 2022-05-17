import {Item, Project} from "compadres-common";

import Automerge, {FreezeObject, BinaryChange, Change} from "automerge";

const TODOS: { [key: string]: FreezeObject<Project> } = {
  todo1: Automerge.from<Project>({
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
    ] as Item[],
  }),
  todo2: Automerge.from<Project>({
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
    ] as Item[],
  }),
};

export class TodoService {
  async listProjects(): Promise<string[]> {
    return Promise.resolve(Object.keys(TODOS));
  }

  async getProject(projectName: string): Promise<Project> {
    if (!(projectName in TODOS)) {
      throw new Error(`Project ${projectName} does not exist`);
    }
    return TODOS[projectName];
  }

  async updateProject(projectName: string, changes: number[][]) {
    if (!(projectName in TODOS)) {
      throw new Error(`Project ${projectName} does not exist`);
    }
    const project = TODOS[projectName];
    const binChanges = changes.map(c => {
      return Uint8Array.from(c) as BinaryChange;
      // const bin = Uint8Array.from(c);
      // (bin as any).__binaryChange = true;
      // return bin as BinaryChange;
    });
    const [nextProject, patch] = Automerge.applyChanges(project, binChanges);
    console.log({patch});
    TODOS[projectName] = nextProject;
  }
}
