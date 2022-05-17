import {Item, Project} from "compadres-common";

import Automerge, {FreezeObject, BinaryChange, Change, BinaryDocument} from "automerge";

const TODOS: { [key: string]: BinaryDocument } = {
  todo1: Automerge.save(Automerge.from<Project>({
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
  })),
  todo2: Automerge.save(Automerge.from<Project>({
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
  })),
};

export class TodoService {
  async listProjects(): Promise<string[]> {
    return Promise.resolve(Object.keys(TODOS));
  }

  async getProject(projectName: string): Promise<BinaryDocument> {
    if (!(projectName in TODOS)) {
      throw new Error(`Project ${projectName} does not exist`);
    }
    return TODOS[projectName];
  }

  async updateProject(projectName: string, changes: Uint8Array[]) {
    if (!(projectName in TODOS)) {
      throw new Error(`Project ${projectName} does not exist`);
    }
    const project = Automerge.load<Project>(TODOS[projectName]);
    const binChanges = changes.map(c => {
      return Uint8Array.from(c) as BinaryChange;
      // const bin = Uint8Array.from(c);
      // (bin as any).__binaryChange = true;
      // return bin as BinaryChange;
    });
    const [nextProject, patch] = Automerge.applyChanges(project, binChanges);
    console.log({patch});
    TODOS[projectName] = Automerge.save(nextProject);
  }
}
