class Note {
  constructor(
    public id: number,
    protected title: string,
    protected content: string,
    public user?: User, // Association: A Note is associated with a User
  ) {}

  prieview() {
    return `Note Title : ${this.title} 
    Note Content : ${this.content} 
    Note User : ${this.user ? this.user.name : "Unassigned"} `;
  }
}

class NoteBook {
  constructor(private notes: Note[]) {}

  addNote(note: Note) {
    this.notes = [...this.notes, note];
  }

  removeNote(note: Note) {
    this.notes = this.notes.filter((n) => n.id !== note.id);
  }
}

class User {
  constructor(
    protected id: number,
    public name: string,
    protected email: string,
    private password: string,
    protected phone: string,
    protected age: number,
    public notebooks: NoteBook[], // Aggregation: A User can own multiple NoteBooks
  ) {
    if (age < 18 || age > 60) {
      throw new Error("Age must be between 18 and 60");
    }
  }

  displayInfo() {
    return `userName : ${this.name} 
    userEmail : ${this.email} 
    userPhone : ${this.phone} 
    userAge : ${this.age} 
    notebooksCount : ${this.notebooks.length}`;
  }
}

class Admin extends User {
  constructor(
    id: number,
    name: string,
    email: string,
    password: string,
    phone: string,
    age: number,
    notebooks: NoteBook[],
  ) {
    super(id, name, email, password, phone, age, notebooks);
  }
}

// Example usage and verification
const note1 = new Note(1, "Task 5", "Implement Aggregation");
const note2 = new Note(2, "Task 6", "Implement Association");

const userNotebook = new NoteBook([note1]);
const adminNotebook = new NoteBook([note2]);

const user = new User(
  1,
  "John Doe",
  "john@example.com",
  "securePass123",
  "1234567890",
  25,
  [userNotebook], // Aggregation relationship established here
);
const adminUser = new Admin(
  1,
  "Admin Doe",
  "admin@example.com",
  "securePass123",
  "1234567890",
  30,
  [adminNotebook], // Aggregation relationship established here
);

// Establishing Association relationship
note1.user = user;
note2.user = adminUser;

console.log("User Info:");
console.log(user.displayInfo());

console.log("\nNote 1 Preview:");
console.log(note1.prieview());

console.log("\nNote 2 Preview:");
console.log(note2.prieview());

console.log("\nAdmin Info:");
console.log(adminUser.displayInfo());

// #######################################################################

class storage<T> {
  constructor(public items: T[]) {}

  addItem(item: T) {
    this.items = [...this.items, item];
  }

  removeItem(item: T) {
    this.items = this.items.filter((i) => i !== item);
  }

  getAllItems() {
    return this.items;
  }
}

const stringStorage = new storage<string>([]);
stringStorage.addItem("Hello");
stringStorage.addItem("World");
stringStorage.removeItem("Hello");
console.log(stringStorage.getAllItems());
