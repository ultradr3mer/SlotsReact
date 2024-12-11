interface IRound {
    id: string;
    graph: number[];
    finalBalance: number;
    initialBalance: number;
    inserts: number;
    wins: number;
    startDate: Date;
  }

  export default IRound;