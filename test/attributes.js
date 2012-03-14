var registry = require('../registry.common'),
    expect = require('expect.js');

describe('attribute tests', function() {
    it('can define a type with attributes (drivable.humvee)', function() {
        var def = registry.define('vehicle.humvee', function() {
            return {
                drive: function(from, to) {
                    return 'driving a humvee';
                }
            };
        }, { offroad: true, topspeed: 105 });
        
        expect(def).to.be.ok();
        expect(def.attributes).to.be.ok();
        expect(def.attributes.offroad).to.be.ok();
        expect(def.attributes.topspeed).to.equal(105);
    });
    
    it('can define another type with attributes (drivable.porsche)', function() {
        var def = registry.define('vehicle.porsche', function() {
            return {
                drive: function(from, to) {
                    return 'driving a porsche';
                }
            };
        }, { topspeed: 240 });
        
        expect(def).to.be.ok();
        expect(def.attributes).to.be.ok();;
        expect(def.attributes.offroad).to.not.be.ok();
        expect(def.attributes.topspeed).to.equal(240);
    });
    
    it('can find offroad vehicles with a topspeed > 100', function() {
        var instance = registry('vehicle', 'offroad && topspeed > 100').create();
        
        expect(instance).to.be.ok();
        expect(instance.topspeed).to.equal(105);
    });

    it('can find offroad vehicles with a topspeed > 150 (there are none)', function() {
        var instance = registry('vehicle', 'offroad && topspeed > 150').create();
        
        expect(instance).to.not.be.ok();
    });
});