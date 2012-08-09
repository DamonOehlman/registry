function Person(name) {
    this.name = name;
}

Person.prototype = {
    toString: function() {
        return this.name || '';
    }
};

function Author(name) {
    Person.call(this, name);
    
    this.books = [];
}

describe('prototype extension tests', function() {
    var registry = require('../dist/commonjs/registry'),
        expect = require('expect.js'),
        person;

    it('can scaffold a new prototype', function() {
        var def = registry.scaffold('person', Person);
        
        expect(def).to.be.ok();
        expect(def._prototype).to.be.ok();
    });
    
    it('can create an new instance of person', function() {
        person = registry.create('person', 'Tom Petty');
        
        expect(person).to.be.ok();
    });
    
    it('has initialized the name as per the args passed to create', function() {
        expect(person.name).to.equal('Tom Petty');
        expect(person.toString()).to.equal('Tom Petty');
    });
    
    it('can scaffold an extended prototype', function() {
        var def = registry.scaffold('person.author', Author)
                    .extend({
                        writeBook: function(title) {
                            this.books.push(title);
                        }
                    });
                    
        expect(def).to.be.ok();
    });
    
    it('has not modified the base prototype', function() {
        expect(Person.prototype.writeBook).to.not.be.ok();
    });
    
    it('can create a new instance of author', function() {
        person = registry.create('person.author', 'Oscar Wilde');
    });
    
    it('the author name has been initialized as per the person', function() {
        expect(person.name).to.equal('Oscar Wilde');
    });
    
    it('the constructor for the new class was called successfully (we have a books array)', function() {
        expect(person.books).to.be.ok();
    });
    
    it('the write book method exists for the author', function() {
        person.writeBook('The Picture of Dorian Gray');
        
        expect(person.books).to.have.length(1);
    });
});