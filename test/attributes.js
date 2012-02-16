var IoC = require('IoC'),
    expect = require('chai').expect;

describe('attribute tests', function() {
    it('can define a type with attributes (drivable.humvee)', function() {
        var def = IoC.define('vehicle.humvee[offroad, topspeed=105]', function() {
            return {
                drive: function(from, to) {
                    return 'driving a humvee';
                }
            };
        });
        
        expect(def).to.exist;
        expect(def.attributes).to.exist;
        expect(def.attributes.offroad).to.be.ok;
        expect(def.attributes.topspeed).to.equal(105);
    });
    
    it('can define another type with attributes (drivable.porsche)', function() {
        var def = IoC.define('vehicle.porsche[topspeed=240]', function() {
            return {
                drive: function(from, to) {
                    return 'driving a porsche';
                }
            };
        });
        
        expect(def).to.exist;
        expect(def.attributes).to.exist;
        expect(def.attributes.offroad).to.not.be.ok;
        expect(def.attributes.topspeed).to.equal(240);
    });
    
    it('can find offroad vehicles with a topspeed > 100', function() {
        var instance = IoC.getInstance('vehicle', 'offroad && topspeed > 100');
        
        expect(instance).to.exist;
    });

    it('can find offroad vehicles with a topspeed > 150 (there are none)', function() {
        var instance = IoC.getInstance('vehicle', 'offroad && topspeed > 150');
        
        expect(instance).to.not.exist;
    });
});