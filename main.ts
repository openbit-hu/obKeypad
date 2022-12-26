const ID_IDLE = -1
const ID_DELAY_LIMIT = 10

//% color=#008060 weight=100 icon="\uf11c" block="obKeypad"
namespace obKeypad {
    let keyPin: AnalogPin
    let selectedKey: number
    let repetition: number
    let delay: number
    let keys: number[]
    let userCallback: (code: number, index: number, isAccepted: boolean) => void
    let lowercaseCharacterSet = [['1'], ['2', 'a', 'b', 'c', 'á'], ['3', 'd', 'e', 'f', 'é'], ['<'], ['4', 'g', 'h', 'i', 'í'], ['5', 'j', 'k', 'l'], ['6', 'm', 'n', 'o', 'ó', 'ö', 'ő'], ['>'],
    ['7', 'p', 'q', 'r', 's'], ['8', 't', 'u', 'ú', 'ü', 'ű', 'v'], ['9', 'w', 'x', 'y', 'z'], ['^'], ['#', '?'], ['0', '.', ','], ['*', ':', '+', '-'], ['ˇ']]
    let uppercaseCharacterSet = [['1'], ['2', 'A', 'B', 'C', 'Á'], ['3', 'D', 'E', 'F', 'É'], ['<'], ['4', 'G', 'H', 'I', 'Í'], ['5', 'J', 'K', 'L'], ['6', 'M', 'N', 'O', 'Ó', 'Ö', 'Ő'], ['>'],
    ['7', 'P', 'Q', 'R', 'S'], ['8', 'T', 'U', 'Ú', 'Ü', 'Ű', 'V'], ['9', 'W', 'X', 'Y', 'Z'], ['^'], ['#', '?'], ['0', '.', ','], ['*', ':', '+', '-'], ['ˇ']]
    let defaultKeys = [0, 62, 126, 190, 252, 315, 378, 445, 508, 573, 638, 699, 761, 828, 894, 959]
    //% blockId="obKeypad_initialize"
    //% block="Initializes keypad parameters, reading $pin for analog data, $keyValues to compare values"
    export function initialize(pin: AnalogPin, keyValues: number[]): boolean {
        selectedKey = ID_IDLE
        repetition = 0
        delay = 0
        keyPin = pin
        if (keyValues == null) return false
        if (keyValues.length == 16) {
            keys = keyValues
            loops.everyInterval(100, () => readKey())
            return true
        }
        return false
    }
    //% blockId="obKeypad_getDefaultKeys"
    //% block="Returns an array of default keypad values"
    export function getDefaultKeys(){
        return defaultKeys
    }
    //% blockId="obKeypad_getDefaultLowerCaseCharacterSet"
    //% block="Returns a default lower-case characterset"
    export function getDefaultLowerCaseCharacterSet() {
        return lowercaseCharacterSet
    }
    //% blockId="obKeypad_getDefaultUpperCaseCharacterSet"
    //% block="Returns a default upper-case characterset"
    export function getDefaultUpperCaseCharacterSet() {
        return uppercaseCharacterSet
    }
    //% blockId="obKeypad_onKeyEvent"
    //% block="on $key key event, repeated $n times, $isAccepted is true, if key is no longer pressed."
    export function onKeyEvent(callback: (code: number, n: number, isAccepted: boolean) => void) {
        userCallback = callback
    }
    function readKey() {
        let key = ID_IDLE
        let value = pins.analogReadPin(keyPin)
        if (keys == null) return
        for (let i = 0; i < keys.length; i++) {
            let keyValue = keys[i]
            if ((value > keyValue - 5) && (value < keyValue + 5)) {
                key = i
            }
        }
        if (selectedKey == ID_IDLE) {
            if (key > ID_IDLE) {
                selectedKey = key
                repetition = 0
                delay = 0
                userCallback(selectedKey, repetition, false)
                return
            }
            return
        }
        if (key == ID_IDLE) {
            delay++
            if (delay > ID_DELAY_LIMIT) {
                userCallback(selectedKey, repetition, true)
                selectedKey = ID_IDLE
                repetition = 0
                delay = 0
            }
            return
        }
        if (key != selectedKey) {
            music.playTone(Note.CSharp5, music.beat(BeatFraction.Quarter))
            userCallback(selectedKey, repetition, true)
            selectedKey = ID_IDLE
            repetition = 0
            delay = 0
            return
        }
        // do not count, if key kept pressed 
        if (delay > 0) {
            repetition++
            delay = 0
            userCallback(selectedKey, repetition, false)
        }
    }
}
