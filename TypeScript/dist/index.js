"use strict";
class Note {
    constructor(id, title, content, user) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.user = user;
    }
    prieview() {
        return `Note Title : ${this.title} 
    Note Content : ${this.content} 
    Note User : ${this.user ? this.user.name : "Unassigned"} `;
    }
}
class NoteBook {
    constructor(notes) {
        this.notes = notes;
    }
    addNote(note) {
        this.notes = [...this.notes, note];
    }
    removeNote(note) {
        this.notes = this.notes.filter((n) => n.id !== note.id);
    }
}
class User {
    constructor(id, name, email, password, phone, age, notebooks) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.age = age;
        this.notebooks = notebooks;
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
    constructor(id, name, email, password, phone, age, notebooks) {
        super(id, name, email, password, phone, age, notebooks);
    }
}
const note1 = new Note(1, "Task 5", "Implement Aggregation");
const note2 = new Note(2, "Task 6", "Implement Association");
const userNotebook = new NoteBook([note1]);
const adminNotebook = new NoteBook([note2]);
const user = new User(1, "John Doe", "john@example.com", "securePass123", "1234567890", 25, [userNotebook]);
const adminUser = new Admin(1, "Admin Doe", "admin@example.com", "securePass123", "1234567890", 30, [adminNotebook]);
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
class storage {
    constructor(items) {
        this.items = items;
    }
    addItem(item) {
        this.items = [...this.items, item];
    }
    removeItem(item) {
        this.items = this.items.filter((i) => i !== item);
    }
    getAllItems() {
        return this.items;
    }
}
const stringStorage = new storage([]);
stringStorage.addItem("Hello");
stringStorage.addItem("World");
stringStorage.removeItem("Hello");
console.log(stringStorage.getAllItems());
//# sourceMappingURL=index.js.map