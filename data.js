// --- Code Snippets Data (The Source of Truth) ---
const codeSnippets = [
    `class Dog {
private:
    string name;
public:
    Dog(string n) : name(n) {
        cout << name << " is born." << endl;
    }
    ~Dog() {
        cout << name << " has passed." << endl;
    }
};`,
    `class Animal {
public:
    virtual void makeSound() const {
        cout << "Generic sound." << endl;
    }
    virtual ~Animal() {}
};
class Cat : public Animal {
public:
    void makeSound() const override {
        cout << "Cat says meow." << endl;
    }
};`,
    `class User {
private:
    int id;
public:
    void setId(int i) {
        if (i > 0) id = i;
        else id = 0;
    }
    int getId() const {
        return id;
    }
};`,
    
    `struct Point {
    int x, y;
};
class Shape {
private:
    Point center;
public:
    Shape(int x, int y) {
        center.x = x;
        center.y = y;
    }
    void showData() const {
        cout << center.x << ", " << center.y << endl;
    }
};`,

`
class Student {
private:
    int age; 
    string name; 

public:
    void setData(int a, string n) { 
        age = a;
        name = n;
    }

    void showData() { 
        cout << "Name: " << name << ", Age: " << age << endl;
    }
};`,

`
class Person {
public:
    void speak() {
        cout << "I can speak." << endl;
    }
};

class Teacher : public Person { 
public:
    void teach() {
        cout << "I can teach." << endl;
    }
};`,


`class Shape { 
public:
    virtual void draw() = 0; 
};

class Circle : public Shape {
public:
    void draw() override {
        cout << "Drawing Circle" << endl;
    }
};`,


`class Animal {
public:
    virtual void sound() { 
        cout << "Animal sound" << endl;
    }
};

class Dog : public Animal {
public:
    void sound() override { 
        cout << "Bark!" << endl;
    }
};`
];

// --- Typing Metrics Class (The Data Model) ---
class TypingMetrics {
    // Cumulative counters are essential for multi-snippet challenges
    #totalCorrectChars = 0;
    #totalTypedChars = 0;

    constructor() {
        this.reset();
    }

    reset() {
        this.#totalCorrectChars = 0;
        this.#totalTypedChars = 0;
    }

    /**
     * Records the stats from a single completed or skipped code snippet.
     * @param {number} correctCount - Correct characters typed in the snippet.
     * @param {number} totalCount - Total characters the user attempted to type in the snippet.
     */
    addCodeStats(correctCount, totalCount) {
        this.#totalCorrectChars += correctCount;
        this.#totalTypedChars += totalCount;
    }

    /**
     * Calculates and returns the live (current snippet) metrics.
     */
    getLiveMetrics(currentCorrect, currentTotal) {
        let accuracy = 0;
        if (currentTotal > 0) {
            accuracy = (currentCorrect / currentTotal) * 100;
        }
        return {
            accuracy: accuracy.toFixed(0)
        };
    }

    /**
     * Calculates and returns the final overall results after the game ends.
     */
    getFinalResults() {
        let finalAccuracy = 0;
        
        if (this.#totalTypedChars > 0) {
            // CRITICAL FIX: Use cumulative totals for the final score
            finalAccuracy = (this.#totalCorrectChars / this.#totalTypedChars) * 100;
        }
        
        return {
            // Return accuracy rounded to a whole number for display
            accuracy: finalAccuracy.toFixed(0) 
        };
    }
}


// 🔑 CRITICAL STEP: Attach to the global window object
// This ensures game.js can access these variables easily.
window.codeSnippets = codeSnippets;
window.TypingMetrics = TypingMetrics;