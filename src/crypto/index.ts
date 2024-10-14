let isDone: boolean = false;
let numbers: number[] = [1, 2, 3, 4, 5];

let tuple: [string, number] = ['', 1];

interface Person {
  name: string;
  age: number;
  address: string;
  greet(): void;
}

let person: Person = {
  name: 'John',
  age: 5,
  address: 'American',
  greet() {
    console.log('Hello World!');
  },
};

person.greet();

interface Animal {
  name: string;
  age: number;
  call(): string;
}
