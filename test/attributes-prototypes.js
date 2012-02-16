var expect = require('chai').expect;

function Vehicle() {
    
}

Vehicle.prototype = {
    drive: function(from, to) {
        return 'driving a vehicle';
    }
};

function OffroadVehicle() {
}

_.extend(OffroadVehicle.prototype, Vehicle.prototype, {
    offroad: true
});

function Humvee() {
}

_.extend(Humvee.prototype, OffroadVehicle.prototype, {
    topspeed: 105,
    
    drive: function(from, to) {
        return 'driving a humvee';
    }
});

function Porsche() {
}

_.extend(Porsche.prototype, Vehicle.prototype, {
    topspeed: 240,
    
    drive: function(from, to) {
        return 'driving a porsche';
    }
});


describe('attribute tests (using prototypes)', function() {
    it('can define a type with attributes (drivable.humvee)', function() {
        var def = IoC.define('vehicle.humvee', Humvee.prototype);
        
        expect(def).to.exist;
        expect(def.attributes).to.exist;
        expect(def.attributes.offroad).to.be.truthy;
        expect(def.attributes.topspeed).to.equal(105);
    });
    
    it('can define another type with attributes (drivable.porsche)', function() {
        var def = IoC.define('vehicle.porsche', Porsche.prototype);
        
        expect(def).to.exist;
        expect(def.attributes).to.exist;
        expect(def.attributes.offroad).to.be.falsy;
        expect(def.attributes.topspeed).to.equal(240);
    });
    
    it('can get an instance of a drivable type', function() {
        var instance = IoC.getInstance('vehicle');
        
        expect(instance).to.exist;
        expect(typeof instance.drive).to.equal('function');
    });
    
    it('can get an instance based on an equality query (offroad)', function() {
        var instance = IoC.getInstance('vehicle', 'offroad == true');
        
        expect(instance).to.exist;
        expect(instance.drive()).to.equal('driving a humvee');
    });
    
    it('can get an instance based on a greater than query (topspeed > 150)', function() {
        var instance = IoC.getInstance('vehicle', 'topspeed > 150');
        
        expect(instance).to.exist;
        expect(instance.drive()).to.equal('driving a porsche');
    });
});