//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// See LICENCE for licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

// --[ Dependencies ]---------------------------------------------------
const assertType = require('folktale/helpers/assertType');
const flEquals = require('folktale/core/fantasy-land/equals');
const fl = require('folktale/helpers/fantasy-land');
const provideAliases = require('folktale/helpers/provide-fantasy-land-aliases');
const copyDocs = require('folktale/helpers/copy-documentation');
const { tagSymbol, typeSymbol } = require('./data');


// --[ Helpers ]--------------------------------------------------------

/*~
 * True if the value conforms to the Setoid interface.
 * 
 * ---
 * type: (Any) => Boolean
 */
const isSetoid = (value) => value != null 
                         && (typeof value[fl.equals] === 'function' || typeof value.equals === 'function');

/*~
 * True if two variant instances are of the same type/tag.
 * 
 * ---
 * type: (Variant, Variant) => Boolean
 */
const sameType = (a, b) => a[typeSymbol] === b[typeSymbol] 
                        && a[tagSymbol] === b[tagSymbol];


// --[ Implementation ]------------------------------------------------
/*~
 * ---
 * category: Derivation
 * stability: experimental
 * authors:
 *   - "@boris-marinov"
 * 
 * type: |
 *   (('a, 'a) => Boolean) => (Variant, ADT) => Void
 */
const createDerivation = (valuesEqual) => {
  /*~
   * Tests if two objects are equal.
   * ---
   * type: ('a, 'a) => Boolean
   */
  const equals = (a, b) => {
    // identical objects must be equal
    if (a === b)  return true;

    // we require both values to be setoids if one of them is
    const leftSetoid  = isSetoid(a);
    const rightSetoid = isSetoid(b);
    if (leftSetoid) {
      if (rightSetoid)  return flEquals(a, b);
      else              return false;
    }

    // fall back to the provided equality
    return valuesEqual(a, b);
  };


  /*~
   * Tests if two variants are equal.
   * ---
   * type: (Object Any, Object Any, Array String) => Boolean
   */
  const compositesEqual = (a, b, keys) => {
    for (let i = 0; i < keys.length; ++i) {
      const keyA = a[keys[i]];
      const keyB = b[keys[i]];
      if (!(equals(keyA, keyB))) {
        return false;
      }
    }
    return true;
  };


  const derivation = (variant, adt) => {
    /*~
     * Compares two setoids structurally.
     * ---
     * category: Comparing and testing
     * stability: experimental
     * authors:
     *   - "@boris-marinov"
     *   - Quildreen Motta
     * 
     * type: |
     *   forall S, a:
     *     (S a).(S a) => Boolean
     *   where S is Setoid
     */
    variant.prototype.equals = function(value) {
      assertType(adt)(`${this[tagSymbol]}#equals`, value);
      return sameType(this, value) && compositesEqual(this, value, Object.keys(this));
    };
    provideAliases(variant.prototype);
    return variant;
  };
  copyDocs(createDerivation, derivation, {
    type: '(Variant, ADT) => Void'
  });


  return derivation;
};


// --[ Exports ]-------------------------------------------------------
module.exports = createDerivation((a, b) => a === b);
module.exports.withEquality = createDerivation;
