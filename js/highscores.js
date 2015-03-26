var test = {
    'notes': {
        'best': {
            'score': 23,
            'percentage': 90
        },
        'latest': {
            'score': 21,
            'percentage': 100
        }
    },
    'intervals': {
        'best': {
            'score': 36,
            'percentage': 84
        },
        'latest': {
            'score': 17,
            'percentage': 100
        }
    },
    'scales': {
        'best': {
            'score': 18,
            'percentage': 62
        },
        'latest': {
            'score': 18,
            'percentage': 62
        }
    }
};

var testJson = JSON.stringify(test);

localStorage.setItem('testing', testJson);

var testRetrieved = localStorage.getItem('testing');

var testParsed = JSON.parse(testRetrieved);

console.log(testParsed);
