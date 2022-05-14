const TODOS = {
  todo1: {
    name: "Groceries",
    items: [
      {
        title: "Canned beans",
        done: false,
      },
      {
        title: "Carrots",
        done: true,
      },
      {
        title: "Zucchini",
        done: false,
      },
    ],
  },
  todo2: {
    name: "Daily routine",
    items: [
      {
        title: "Brush teeth",
        done: true,
      },
      {
        title: "Exercise",
        done: false,
      },
      {
        title: "Walk outsite",
        done: true,
      },
      {
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
}
