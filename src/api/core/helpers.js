import ForEach from 'lodash-es/forEach';
import IsEqual from 'lodash-es/isEqual';
import IsNil from 'lodash-es/isNil';
import IsObject from 'lodash-es/isObject';



export function changedPaths(base, object, options) {
    options = {
        array: true,
        object: true,

        ...(options || {})
    };

    let keys = [];

    function exec(base, object, prefix) {
        ForEach(object, (value, key) => {
            if(!IsNil(base) && IsEqual(value, base[key])) {
                return;
            }

            // Append path
            keys.push(`${prefix || ''}${key}`);

            // Find changes with `value`
            if(Array.isArray(value)) {
                if(!options.array) {
                    return;
                }

                // Find array changes with `value`
                exec(!IsNil(base) ? base[key] : null, value, `${prefix || ''}${key}.`);
            } else if(IsObject(value)) {
                if(!options.object) {
                    return;
                }

                // Find object changes with `value`
                exec(!IsNil(base) ? base[key] : null, value, `${prefix || ''}${key}.`);
            }
        });
    }

    // Find changes in object
    exec(base, object);

    // Return changed keys
    return keys;
}
