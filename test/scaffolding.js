function PushCart() {
    this.wheels = 4;
}

PushCart.prototype = {
    drive: function(from, to) {
        return 'driving a pushcart';
    }
};

describe('scaffolding tests', function() {
    var registry = require('../dist/commonjs/registry'),
        expect = require('expect.js'),
        vehicle;

    it('can scaffold a new prototype', function() {
        registry.scaffold('vehicle.pushcart', PushCart);
    });
    
    it('can create a new instance of the scaffolded function', function() {
        vehicle = registry('vehicle.pushcart');
        expect(vehicle).to.be.ok();
    });
    
    it('has created an object with a drive method on the prototype', function() {
        expect(typeof vehicle.drive).to.equal('function');
        expect(vehicle.drive()).to.equal('driving a pushcart');
    });
    
    it('has created the new object as an instanceof PushCart', function() {
        expect(vehicle instanceof PushCart).to.be.ok();
    });
    
    it('has created the new object using the constructor', function() {
        expect(vehicle.wheels).to.equal(4);
    });
    
    it('can scaffold a new prototype with no constructor', function() {
        registry.scaffold('vehicle.scooter', {
            drive: function(from, to) {
                return 'riding a scooter';
            }
        });
    });
    
    it('can create an instance of the scooter', function() {
        vehicle = registry('vehicle.scooter');
        expect(vehicle).to.be.ok();
    });
    
    it('can call the drive method of the scooter', function() {
        expect(typeof vehicle.drive).to.equal('function');
        expect(vehicle.drive()).to.equal('riding a scooter');
    });
});