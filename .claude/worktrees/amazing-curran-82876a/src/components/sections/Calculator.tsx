import { useState, useEffect } from 'react'
import { FormEvent } from 'react';
import { toast } from 'react-hot-toast';
export default function Calculator() {
    const puns = [
        {
            id: 1,
            content: "You will eventually get it, I believe you.",
        },
        {
            id: 2,
            content: "Today must be your lucky day, don't believe me? test it",
        },
        {
            id: 3,
            content: "I see you came back for me. Calculate now and let me see it",
        },
        {
            id: 4,
            content: "You just won't stop pushing it will you",
        },
        {
            id: 5,
            content: "I think you are just embarrassing yourself right now",
        },
        {
            id: 6,
            content: "I give up. call me, I'll give you the answer over text"
        },
    ]

    const [selectedPun, setSelectedPun] = useState('If you get it the first time, it will be good for you. Promise ^ _ ^')
    const [inputValue, setInputValue] = useState('')
    const [previousAnswers, setPreviousAnswers] = useState<string[]>([])
    const num1 = 544;
    const num2 = 600;

    useEffect(() => {


        console.log("something just ran")
    }, [previousAnswers])

    function getRandomIndex(max: number) {
        return Math.floor(Math.random() * max);
    }

    function getPreviousAnswer(inputValue: string) {

        const prevAns = [...previousAnswers, inputValue]
        return prevAns;
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault(); // Prevent form from refreshing the page

        // gets maximum number of puns (should be puns.length, not +1)
        const maximum_puns = puns.length;
        // converts input data to int
        const userGivenAnswer = parseInt(inputValue);

        // Check if the input is a valid number
        if (isNaN(userGivenAnswer) || inputValue.trim() === '') {
            setSelectedPun("Please enter a valid number!");
            return;
        }

        // get random selected pun string based on maximum number of puns
        const myPun = puns[getRandomIndex(maximum_puns)].content;

        // check whether the answer matches up
        if (num1 * num2 === userGivenAnswer) {
            // if answer is correct
            setSelectedPun('Ok Ok! Seems you know your stuff. God, talk about a show off!');
        } else {
            // if answer is wrong
            setSelectedPun(myPun);
        }

        let answers = getPreviousAnswer(userGivenAnswer.toString());
        setPreviousAnswers(answers);
        console.log(answers)
        toast.success(`Your answer: ${userGivenAnswer}`)

        // Clear the input after submission
        setInputValue('');
    }
    return (
        <div className="calculator-section p-8">
            <h2 className="text-2xl font-domine font-bold text-sexyblue mb-4">
                What is {num1} × {num2}?
            </h2>
            <form onSubmit={handleSubmit} className="mb-4">
                <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="maybe 45?"
                    className="border border-sexyblue/30 rounded px-4 py-2 mr-4 text-sexyblue"
                />
                <button
                    type="submit"
                    className="bg-sexyblue text-white px-6 py-2 rounded hover:bg-sexyblue/80 transition-colors"
                >
                    Click me to calculate
                </button>
            </form>
            <p className="text-lg text-sexyblue font-domine">{selectedPun}</p>

            <div className="previous-answers mt-8">
                <h3 className="text-lg font-domine font-bold text-sexyblue mb-2">Previous Answers:</h3>
                <ul className="list-disc list-inside flex flex-col gap-2">
                    {previousAnswers.map((answer, index) => (
                        <li key={index} className="text-sexyblue">{answer}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
