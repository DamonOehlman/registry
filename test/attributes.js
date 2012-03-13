var registry = require('../registry.node'),
    expect = require('expect.js');

describe('attribute tests', function() {
    it('can define a type with attributes (drivable.humvee)', function() {
        var def = registry.define('vehicle.humvee', { offroad: true, topspeed: 105 }, function() {
            return {
                drive: function(from, to) {
                    return 'driving a humvee';
                }
            };
        });
        
        expect(def).to.be.ok();
        expect(def.attributes).to.be.ok();
        expect(def.attributes.offroad).to.be.ok();
        expect(def.attributes.topspeed).to.equal(105);
    });
    
    it('can define another type with attributes (drivable.porsche)', function() {
        var def = registry.define('vehicle.porsche', { topspeed: 240 }, function() {
            return {
                drive: function(from, to) {
                    return 'driving a porsche';
                }
            };
        });
        
        expect(def).to.be.ok();
        expect(def.attributes).to.be.ok();;
        expect(def.attributes.offroad).to.not.be.ok();
        expect(def.attributes.topspeed).to.equal(240);
    });
    
    it('can find offroad vehicles with a topspeed > 100', function() {
        var matches = registry('vehicle', 'offroad && topspeed > 100');
        
        expect(matches).to.have.length(1);
    });

    it('can find offroad vehicles with a topspeed > 150 (there are none)', function() {
        var matches = registry('vehicle', 'offroad && topspeed > 150');
        
        expect(matches).to.have.length(0);
    });
});