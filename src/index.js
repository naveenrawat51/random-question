import './styles/main.scss';

const code = localStorage.getItem('codeName');

if (code == 'yash') {
    let today = new Date().toLocaleDateString();
    const currentDate = localStorage.getItem('todayDate');
    if (today !== currentDate) {
        localStorage.setItem('questions', JSON.stringify([]));
    }
    localStorage.setItem('todayDate', today);

    const questionCont = document.querySelector('.all-Questions-container');

    fetch(
        'https://random-questions-of-day-default-rtdb.firebaseio.com/random-questions-of-day-default-rtdb.json'
    )
        .then((data) => data.json())
        .then((data) => {
            const resData = data.filter(
                (q) => q.doNotAppear == false || q.doNotAppear == undefined
            );

            if (today == currentDate) {
                const quesArr = JSON.parse(localStorage.getItem('questions'));
                let allQuestionStr = '';
                for (let i = 0; i < 3; i++) {
                    console.log('questions are in local storage');
                    allQuestionStr += setupQuestion(resData, quesArr[i]);
                }
                questionCont.innerHTML = allQuestionStr;
            } else {
                let allQuestionStr = '';
                for (let i = 0; i < 3; i++) {
                    console.log('no question in local storage');
                    allQuestionStr += setupQuestion(resData);
                }
                questionCont.innerHTML = allQuestionStr;
            }
        });

    function getRandomNumberBetween(max) {
        return Math.floor(Math.random() * max) + 1;
    }

    function setupQuestion(arr, q) {
        const questionNumber = getRandomNumberBetween(arr.length - 1);
        const currentQuestion = arr[questionNumber];
        if (!q) {
            const questions = JSON.parse(localStorage.getItem('questions'));
            questions.push(currentQuestion);
            localStorage.setItem('questions', JSON.stringify(questions));
        }
        const text = q ? q.question_text : currentQuestion.question_text;
        const link = q ? q.question_link : currentQuestion.question_link;

        return quesTemplate(text, link, null, q ? q : currentQuestion);
    }

    function quesTemplate(text, link, count, quesData) {
        return `<div class="question-container">
    <p class="today-date">${today}</p>
    <div class="question-desc">
        <a href="${link}" class="text" target="_blank">${text}</a>
        <div>
        <button class="btn ${quesData.isDisabled ? 'disable' : ''}" id=${
            quesData.id
        }>Solve Problem</button> 
        </div>
        </div>
    <p class="appear-time">Appeared: ${count > 0 || 0}</p>
    <p class="don-see"><span>I don't wanna see this again </span><input class="chbk" type="checkbox" id=${
        quesData.id
    }c></p>
</div>`;
    }

    window.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.target.type == 'submit') {
            const btnId = e.target.id;
            const arrData = JSON.parse(localStorage.getItem('questions'));
            console.log(arrData, btnId);
            const currentQues = arrData.find((q) => q.id == btnId);

            const chbox = document.getElementById(btnId + 'c');

            const appCount =
                currentQues && currentQues.appearCount
                    ? parseInt(currentQues.appearCount) + 1
                    : 1;
            currentQues.appearCount = appCount;

            currentQues.doNotAppear = chbox.checked;

            fetch(
                `https://random-questions-of-day-default-rtdb.firebaseio.com/random-questions-of-day-default-rtdb/${currentQues.id}.json`,
                {
                    method: 'PUT',
                    body: JSON.stringify(currentQues),
                }
            );

            e.target.classList.add('disable');
            currentQues.isDisabled = true;
            localStorage.setItem('questions', JSON.stringify(arrData));
        }
    });
} else {
    const promptValue = prompt('Enter the code please');
    localStorage.setItem('codeName', promptValue);
}
