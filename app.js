
        // Application state
        const state = {
            currentCategory: null,
            currentLanguage: null,
            currentLevel: null,
            currentSubLevel: null,
            currentQuestion: 0,
            userAnswers: [],
            questions: [],
            quizStarted: false
        };
        
        
        const splashScreen = document.getElementById('splash-screen');
        const appContainer = document.getElementById('app-container');
        const categoryContainer = document.getElementById('category-container');
        const languageSelection = document.getElementById('language-selection');
        const levelSelection = document.getElementById('level-selection');
        const sublevelSelection = document.getElementById('sublevel-selection');
        const quizContainer = document.getElementById('quiz-container');
        const resultsContainer = document.getElementById('results-container');
        const dynamicContent = document.getElementById('dynamic-content');
        
        // loader
        function initApp() {
            // Hide splash screen after 2.5 seconds or on click
            setTimeout(hideSplash, 2500);
            splashScreen.addEventListener('click', hideSplash);
            
            // Set up event listeners
            setupEventListeners();
            
            // Generate questions database
            generateQuestionsDatabase();
        }
        
        // Hide splash screen and show app
        function hideSplash() {
            splashScreen.style.opacity = '0';
            setTimeout(() => {
                splashScreen.style.display = 'none';
                appContainer.style.display = 'block';
            }, 500);
        }
        
        // Set up event listeners
        function setupEventListeners() {
            // Category selection
            document.querySelectorAll('.btn-category:not([disabled])').forEach(btn => {
                btn.addEventListener('click', () => {
                    state.currentCategory = btn.dataset.category;
                    showLanguageSelection();
                });
            });
            
            // Back buttons
            document.querySelectorAll('.btn-back').forEach(btn => {
                btn.addEventListener('click', goBack);
            });
            
            // Language selection
            document.querySelectorAll('[data-language]').forEach(btn => {
                btn.addEventListener('click', () => {
                    state.currentLanguage = btn.dataset.language;
                    showLevelSelection();
                });
            });
            
            // Level selection
            document.querySelectorAll('[data-level]').forEach(btn => {
                btn.addEventListener('click', () => {
                    state.currentLevel = btn.dataset.level;
                    showSubLevelSelection();
                });
            });
            
            // Sub-level selection
            document.querySelectorAll('[data-sublevel]').forEach(btn => {
                btn.addEventListener('click', () => {
                    state.currentSubLevel = parseInt(btn.dataset.sublevel);
                    startQuiz();
                });
            });
        }
        
        // Navigation functions
        function showLanguageSelection() {
            hideAllSections();
            languageSelection.style.display = 'block';
        }
        
        function showLevelSelection() {
            hideAllSections();
            levelSelection.style.display = 'block';
        }
        
        function showSubLevelSelection() {
            hideAllSections();
            sublevelSelection.style.display = 'block';
        }
        
        function startQuiz() {
            hideAllSections();
            quizContainer.style.display = 'block';
            
            // Get questions for current selection
            state.questions = getQuestionsForSelection();
            state.currentQuestion = 0;
            state.userAnswers = new Array(state.questions.length).fill(null);
            state.quizStarted = true;
            
            renderQuestion();
        }
        
        function showResults() {
            hideAllSections();
            resultsContainer.style.display = 'block';
            
            // Calculate score
            const score = calculateScore();
            renderResults(score);
        }
        
        function goBack() {
            if (state.quizStarted) {
                // If in quiz, go back to sub-level selection
                state.quizStarted = false;
                showSubLevelSelection();
            } else if (state.currentSubLevel !== null) {
                state.currentSubLevel = null;
                showLevelSelection();
            } else if (state.currentLevel !== null) {
                state.currentLevel = null;
                showLanguageSelection();
            } else if (state.currentLanguage !== null) {
                state.currentLanguage = null;
                showLanguageSelection();
            } else {
                state.currentCategory = null;
                // For this demo, we don't have a category selection screen after language selection
            }
        }
        
        function hideAllSections() {
            languageSelection.style.display = 'none';
            levelSelection.style.display = 'none';
            sublevelSelection.style.display = 'none';
            quizContainer.style.display = 'none';
            resultsContainer.style.display = 'none';
        }
        
        // Question rendering
        function renderQuestion() {
            if (state.currentQuestion >= state.questions.length) {
                showResults();
                return;
            }
            
            const question = state.questions[state.currentQuestion];
            const optionsHtml = question.options.map((option, index) => {
                const isSelected = state.userAnswers[state.currentQuestion] === index;
                const optionLetter = String.fromCharCode(65 + index);
                
                return `
                    <div class="option ${isSelected ? 'selected' : ''}" data-option="${index}">
                        <span class="option-label">${optionLetter}</span>
                        ${option.text}
                    </div>
                `;
            }).join('');
            
            const progressPercent = ((state.currentQuestion + 1) / state.questions.length) * 100;
            
            quizContainer.innerHTML = `
                <div class="quiz-header">
                    <div class="question-counter">Question ${state.currentQuestion + 1} of ${state.questions.length}</div>
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                
                <div class="question">${question.text}</div>
                
                <div class="options-container">
                    ${optionsHtml}
                </div>
                
                <div class="quiz-navigation">
                    <button class="btn btn-back"><i class="fas fa-arrow-left"></i> Back</button>
                    <button class="btn" id="next-question-btn">
                        ${state.currentQuestion === state.questions.length - 1 ? 
                            '<i class="fas fa-flag-checkered"></i> Finish Quiz' : 
                            '<i class="fas fa-arrow-right"></i> Next Question'}
                    </button>
                </div>
            `;
            
            // Add event listeners to options
            document.querySelectorAll('.option').forEach(option => {
                option.addEventListener('click', () => {
                    // Deselect all options
                    document.querySelectorAll('.option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    
                    // Select clicked option
                    option.classList.add('selected');
                    state.userAnswers[state.currentQuestion] = parseInt(option.dataset.option);
                });
            });
            
            // Next question button
            document.getElementById('next-question-btn').addEventListener('click', () => {
                // If no answer selected, don't proceed
                if (state.userAnswers[state.currentQuestion] === null) {
                    alert('Please select an answer before proceeding');
                    return;
                }
                
                state.currentQuestion++;
                renderQuestion();
            });
            
            // Back button
            document.querySelector('.btn-back').addEventListener('click', goBack);
        }
        
        // Results rendering
        function renderResults(score) {
            // Feedback message based on score
            let feedback, feedbackClass;
            if (score <= 10) {
                feedback = "Keep practicing— you can do it!";
                feedbackClass = "feedback-beginner";
            } else if (score <= 15) {
                feedback = "Good job— you're getting there!";
                feedbackClass = "feedback-intermediate";
            } else if (score === 20) {
                feedback = "Excellent— perfect score!";
                feedbackClass = "feedback-expert";
            } else {
                feedback = "Well done!";
                feedbackClass = "feedback-interview";
            }
            
            // Find incorrect questions
            const incorrectQuestions = state.questions.filter((question, index) => {
                const userAnswerIndex = state.userAnswers[index];
                return userAnswerIndex === null || 
                       question.options[userAnswerIndex].correct !== true;
            });
            
            // Generate HTML for incorrect questions
            let incorrectHtml = '';
            if (incorrectQuestions.length > 0) {
                incorrectHtml = `
                    <div class="incorrect-questions">
                        <h3><i class="fas fa-exclamation-circle"></i> Questions to Review (${incorrectQuestions.length})</h3>
                        ${incorrectQuestions.map((q, i) => `
                            <div class="incorrect-item">
                                <div class="question">${i + 1}. ${q.text}</div>
                                <div><i class="fas fa-check-circle"></i> Correct answer: ${q.options.find(opt => opt.correct).text}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                incorrectHtml = '<p><i class="fas fa-check-circle"></i> Perfect! You answered all questions correctly.</p>';
            }
            
            resultsContainer.innerHTML = `
                <h2 class="panel-title"><i class="fas fa-trophy"></i> Quiz Results</h2>
                <div class="score-display">${score}/${state.questions.length}</div>
                <div class="feedback ${feedbackClass}">${feedback}</div>
                
                ${incorrectHtml}
                
                <div style="margin-top: 30px;">
                    <button class="btn" id="restart-btn">
                        <i class="fas fa-redo"></i> Restart Quiz
                    </button>
                    <button class="btn btn-back">
                        <i class="fas fa-arrow-left"></i> Back to Levels
                    </button>
                </div>
            `;
            
            // Restart button
            document.getElementById('restart-btn').addEventListener('click', () => {
                startQuiz();
            });
            
            // Back button
            document.querySelector('.btn-back').addEventListener('click', goBack);
        }
        
        // Calculate score
        function calculateScore() {
            return state.questions.reduce((score, question, index) => {
                const userAnswerIndex = state.userAnswers[index];
                if (userAnswerIndex !== null && question.options[userAnswerIndex].correct) {
                    return score + 1;
                }
                return score;
            }, 0);
        }
        
        // Generate a comprehensive questions database
        function generateQuestionsDatabase() {
            window.questionsDB = {
                html: {
                    beginner: {
                        1: generateHTMLQuestions('Beginner', 1, 20),
                        2: generateHTMLQuestions('Beginner', 2, 20),
                        3: generateHTMLQuestions('Beginner', 3, 20),
                        4: generateHTMLQuestions('Beginner', 4, 20),
                        5: generateHTMLQuestions('Beginner', 5, 20)
                    },
                    intermediate: {
                        1: generateHTMLQuestions('Intermediate', 1, 20),
                        2: generateHTMLQuestions('Intermediate', 2, 20),
                        3: generateHTMLQuestions('Intermediate', 3, 20),
                        4: generateHTMLQuestions('Intermediate', 4, 20),
                        5: generateHTMLQuestions('Intermediate', 5, 20)
                    },
                    expert: {
                        1: generateHTMLQuestions('Expert', 1, 20),
                        2: generateHTMLQuestions('Expert', 2, 20),
                        3: generateHTMLQuestions('Expert', 3, 20),
                        4: generateHTMLQuestions('Expert', 4, 20),
                        5: generateHTMLQuestions('Expert', 5, 20)
                    },
                    interview: {
                        1: generateHTMLQuestions('Interview', 1, 20),
                        2: generateHTMLQuestions('Interview', 2, 20),
                        3: generateHTMLQuestions('Interview', 3, 20),
                        4: generateHTMLQuestions('Interview', 4, 20),
                        5: generateHTMLQuestions('Interview', 5, 20)
                    }
                },
                css: {
                    beginner: {
                        1: generateCSSQuestions('Beginner', 1, 20),
                        2: generateCSSQuestions('Beginner', 2, 20),
                        3: generateCSSQuestions('Beginner', 3, 20),
                        4: generateCSSQuestions('Beginner', 4, 20),
                        5: generateCSSQuestions('Beginner', 5, 20)
                    },
                    intermediate: {
                        1: generateCSSQuestions('Intermediate', 1, 20),
                        2: generateCSSQuestions('Intermediate', 2, 20),
                        3: generateCSSQuestions('Intermediate', 3, 20),
                        4: generateCSSQuestions('Intermediate', 4, 20),
                        5: generateCSSQuestions('Intermediate', 5, 20)
                    },
                    expert: {
                        1: generateCSSQuestions('Expert', 1, 20),
                        2: generateCSSQuestions('Expert', 2, 20),
                        3: generateCSSQuestions('Expert', 3, 20),
                        4: generateCSSQuestions('Expert', 4, 20),
                        5: generateCSSQuestions('Expert', 5, 20)
                    },
                    interview: {
                        1: generateCSSQuestions('Interview', 1, 20),
                        2: generateCSSQuestions('Interview', 2, 20),
                        3: generateCSSQuestions('Interview', 3, 20),
                        4: generateCSSQuestions('Interview', 4, 20),
                        5: generateCSSQuestions('Interview', 5, 20)
                    }
                },
                javascript: {
                    beginner: {
                        1: generateJSQuestions('Beginner', 1, 20),
                        2: generateJSQuestions('Beginner', 2, 20),
                        3: generateJSQuestions('Beginner', 3, 20),
                        4: generateJSQuestions('Beginner', 4, 20),
                        5: generateJSQuestions('Beginner', 5, 20)
                    },
                    intermediate: {
                        1: generateJSQuestions('Intermediate', 1, 20),
                        2: generateJSQuestions('Intermediate', 2, 20),
                        3: generateJSQuestions('Intermediate', 3, 20),
                        4: generateJSQuestions('Intermediate', 4, 20),
                        5: generateJSQuestions('Intermediate', 5, 20)
                    },
                    expert: {
                        1: generateJSQuestions('Expert', 1, 20),
                        2: generateJSQuestions('Expert', 2, 20),
                        3: generateJSQuestions('Expert', 3, 20),
                        4: generateJSQuestions('Expert', 4, 20),
                        5: generateJSQuestions('Expert', 5, 20)
                    },
                    interview: {
                        1: generateJSQuestions('Interview', 1, 20),
                        2: generateJSQuestions('Interview', 2, 20),
                        3: generateJSQuestions('Interview', 3, 20),
                        4: generateJSQuestions('Interview', 4, 20),
                        5: generateJSQuestions('Interview', 5, 20)
                    }
                }
            };
        }
        
        // Generate HTML questions
        function generateHTMLQuestions(level, subLevel, count) {
            const questions = [];
            const levelPrefix = `${level} (Sub-level ${subLevel})`;
            
            // Beginner questions
            if (level === 'Beginner') {
                for (let i = 1; i <= count; i++) {
                    let question, options;
                    
                    if (i % 4 === 0) {
                        question = `${levelPrefix}: What is the correct HTML element for inserting a line break?`;
                        options = [
                            { text: "&lt;br&gt;", correct: true },
                            { text: "&lt;lb&gt;" },
                            { text: "&lt;break&gt;" },
                            { text: "&lt;linebreak&gt;" }
                        ];
                    } else if (i % 4 === 1) {
                        question = `${levelPrefix}: Which HTML attribute specifies an alternate text for an image?`;
                        options = [
                            { text: "title" },
                            { text: "src" },
                            { text: "alt", correct: true },
                            { text: "href" }
                        ];
                    } else if (i % 4 === 2) {
                        question = `${levelPrefix}: Which tag is used to define an unordered list?`;
                        options = [
                            { text: "&lt;ul&gt;", correct: true },
                            { text: "&lt;ol&gt;" },
                            { text: "&lt;li&gt;" },
                            { text: "&lt;list&gt;" }
                        ];
                    } else {
                        question = `${levelPrefix}: What does HTML stand for?`;
                        options = [
                            { text: "Hyperlinks and Text Markup Language" },
                            { text: "Home Tool Markup Language" },
                            { text: "Hyper Text Markup Language", correct: true },
                            { text: "Hyper Transfer Markup Language" }
                        ];
                    }
                    
                    questions.push({ text: question, options });
                }
            }
            // Intermediate questions
            else if (level === 'Intermediate') {
                for (let i = 1; i <= count; i++) {
                    let question, options;
                    
                    if (i % 4 === 0) {
                        question = `${levelPrefix}: What is the purpose of the HTML5 &lt;article&gt; element?`;
                        options = [
                            { text: "To represent a self-contained composition in a document", correct: true },
                            { text: "To define a section of navigation links" },
                            { text: "To contain the main content of a document" },
                            { text: "To define a section in a document" }
                        ];
                    } else if (i % 4 === 1) {
                        question = `${levelPrefix}: Which attribute is used to provide a machine-readable translation of content?`;
                        options = [
                            { text: "translate" },
                            { text: "lang" },
                            { text: "meta" },
                            { text: "data-*", correct: true }
                        ];
                    } else if (i % 4 === 2) {
                        question = `${levelPrefix}: What is the purpose of the HTML &lt;meta&gt; tag?`;
                        options = [
                            { text: "To provide metadata about the HTML document", correct: true },
                            { text: "To define a section of navigation links" },
                            { text: "To contain the main content of a document" },
                            { text: "To define a section in a document" }
                        ];
                    } else {
                        question = `${levelPrefix}: Which HTML5 element is used for sidebar content?`;
                        options = [
                            { text: "&lt;sidebar&gt;" },
                            { text: "&lt;section&gt;" },
                            { text: "&lt;aside&gt;", correct: true },
                            { text: "&lt;nav&gt;" }
                        ];
                    }
                    
                    questions.push({ text: question, options });
                }
            }
            // Expert questions
            else if (level === 'Expert') {
                for (let i = 1; i <= count; i++) {
                    let question, options;
                    
                    if (i % 4 === 0) {
                        question = `${levelPrefix}: How can you make a video automatically start playing when the page loads?`;
                        options = [
                            { text: "&lt;video auto&gt;" },
                            { text: "&lt;video autoplay&gt;", correct: true },
                            { text: "&lt;video start&gt;" },
                            { text: "&lt;video play&gt;" }
                        ];
                    } else if (i % 4 === 1) {
                        question = `${levelPrefix}: What is the purpose of the HTML5 &lt;template&gt; tag?`;
                        options = [
                            { text: "To hold client-side content that is not rendered when a page is loaded", correct: true },
                            { text: "To define reusable content blocks" },
                            { text: "To store hidden form elements" },
                            { text: "To create a layout template" }
                        ];
                    } else if (i % 4 === 2) {
                        question = `${levelPrefix}: Which method is used to draw graphics on the web page?`;
                        options = [
                            { text: "SVG API" },
                            { text: "WebGL API" },
                            { text: "CSS Graphics" },
                            { text: "Canvas API", correct: true }
                        ];
                    } else {
                        question = `${levelPrefix}: How does the HTML5 &lt;picture&gt; element work?`;
                        options = [
                            { text: "It allows multiple sources for an image based on device characteristics", correct: true },
                            { text: "It creates a slideshow of images" },
                            { text: "It embeds a video in the document" },
                            { text: "It defines a container for multiple images" }
                        ];
                    }
                    
                    questions.push({ text: question, options });
                }
            }
            // Interview questions
            else {
                for (let i = 1; i <= count; i++) {
                    let question, options;
                    
                    if (i % 4 === 0) {
                        question = `${levelPrefix}: Explain the difference between async and defer attributes in script tags.`;
                        options = [
                            { text: "Async downloads script in parallel and executes immediately when available. Defer downloads in parallel but executes after HTML parsing.", correct: true },
                            { text: "Async executes after HTML parsing, defer executes immediately" },
                            { text: "Both async and defer execute after HTML parsing" },
                            { text: "There is no difference between them" }
                        ];
                    } else if (i % 4 === 1) {
                        question = `${levelPrefix}: What is the purpose of the HTML5 &lt;datalist&gt; element?`;
                        options = [
                            { text: "To provide an \"autocomplete\" feature for &lt;input&gt; elements", correct: true },
                            { text: "To create a list of data items" },
                            { text: "To define a list of options for a dropdown" },
                            { text: "To store data for JavaScript" }
                        ];
                    } else if (i % 4 === 2) {
                        question = `${levelPrefix}: How does the HTML5 &lt;output&gt; element work?`;
                        options = [
                            { text: "It displays the output of a program" },
                            { text: "It shows the result of a form submission" },
                            { text: "It represents the result of a calculation or user action", correct: true },
                            { text: "It defines a container for output from a script" }
                        ];
                    } else {
                        question = `${levelPrefix}: What is the purpose of the HTML &lt;slot&gt; element?`;
                        options = [
                            { text: "To define a slot for inserting content" },
                            { text: "To create a placeholder in a web component", correct: true },
                            { text: "To create a space for inserting ads" },
                            { text: "To define a container for dynamic content" }
                        ];
                    }
                    
                    questions.push({ text: question, options });
                }
            }
            
            return questions;
        }
        
        // Generate CSS questions
        function generateCSSQuestions(level, subLevel, count) {
            const questions = [];
            const levelPrefix = `${level} (Sub-level ${subLevel})`;
            
            // Beginner questions
            if (level === 'Beginner') {
                for (let i = 1; i <= count; i++) {
                    let question, options;
                    
                    if (i % 4 === 0) {
                        question = `${levelPrefix}: Which property is used to change the background color?`;
                        options = [
                            { text: "background-color", correct: true },
                            { text: "color" },
                            { text: "bgcolor" },
                            { text: "background" }
                        ];
                    } else if (i % 4 === 1) {
                        question = `${levelPrefix}: How do you add a background image?`;
                        options = [
                            { text: "image: url();" },
                            { text: "background: url();" },
                            { text: "bg-image: url();" },
                            { text: "background-image: url();", correct: true }
                        ];
                    } else if (i % 4 === 2) {
                        question = `${levelPrefix}: How do you make text bold?`;
                        options = [
                            { text: "text-style: bold;" },
                            { text: "font-weight: bold;", correct: true },
                            { text: "font: bold;" },
                            { text: "style: bold;" }
                        ];
                    } else {
                        question = `${levelPrefix}: Which property is used to change the font of an element?`;
                        options = [
                            { text: "font-style" },
                            { text: "font-weight" },
                            { text: "text-font" },
                            { text: "font-family", correct: true }
                        ];
                    }
                    
                    questions.push({ text: question, options });
                }
            }
            // Intermediate questions
            else if (level === 'Intermediate') {
                for (let i = 1; i <= count; i++) {
                    let question, options;
                    
                    if (i % 4 === 0) {
                        question = `${levelPrefix}: What does the CSS property 'position: absolute' do?`;
                        options = [
                            { text: "Positions the element relative to its nearest positioned ancestor", correct: true },
                            { text: "Positions the element relative to the viewport" },
                            { text: "Positions the element relative to the normal flow" },
                            { text: "Positions the element relative to the document body" }
                        ];
                    } else if (i % 4 === 1) {
                        question = `${levelPrefix}: What is the CSS box model?`;
                        options = [
                            { text: "A model for creating boxes in CSS" },
                            { text: "A box that wraps around every HTML element", correct: true },
                            { text: "A system for layout using boxes" },
                            { text: "A way to create 3D effects" }
                        ];
                    } else if (i % 4 === 2) {
                        question = `${levelPrefix}: How do you center an element horizontally?`;
                        options = [
                            { text: "text-align: center;" },
                            { text: "align: center;" },
                            { text: "margin: 0 auto;", correct: true },
                            { text: "center: horizontal;" }
                        ];
                    } else {
                        question = `${levelPrefix}: What is the purpose of z-index?`;
                        options = [
                            { text: "To create 3D effects" },
                            { text: "To control the depth of elements" },
                            { text: "To create zoom effects" },
                            { text: "To control the stacking order of elements", correct: true }
                        ];
                    }
                    
                    questions.push({ text: question, options });
                }
            }
            // Expert questions
            else if (level === 'Expert') {
                for (let i = 1; i <= count; i++) {
                    let question, options;
                    
                    if (i % 4 === 0) {
                        question = `${levelPrefix}: How does the CSS Grid 'fr' unit work?`;
                        options = [
                            { text: "It represents a fraction of the available space in the grid container", correct: true },
                            { text: "It represents a fixed pixel value" },
                            { text: "It represents a percentage of the viewport width" },
                            { text: "It represents the minimum content size" }
                        ];
                    } else if (i % 4 === 1) {
                        question = `${levelPrefix}: What is the purpose of CSS custom properties (variables)?`;
                        options = [
                            { text: "To create custom CSS properties" },
                            { text: "To store values that can be reused throughout a document", correct: true },
                            { text: "To define variables for JavaScript" },
                            { text: "To store user preferences" }
                        ];
                    } else if (i % 4 === 2) {
                        question = `${levelPrefix}: How does the CSS 'clip-path' property work?`;
                        options = [
                            { text: "It defines a specific region of an element to display", correct: true },
                            { text: "It clips an element to a specific size" },
                            { text: "It creates a path for text to follow" },
                            { text: "It defines the outline of an element" }
                        ];
                    } else {
                        question = `${levelPrefix}: What is the purpose of the CSS 'contain' property?`;
                        options = [
                            { text: "To contain overflow content" },
                            { text: "To prevent an element from expanding" },
                            { text: "To indicate that an element and its contents are as independent as possible", correct: true },
                            { text: "To restrict the size of an element" }
                        ];
                    }
                    
                    questions.push({ text: question, options });
                }
            }
            // Interview questions
            else {
                for (let i = 1; i <= count; i++) {
                    let question, options;
                    
                    if (i % 4 === 0) {
                        question = `${levelPrefix}: Explain the CSS Box Model.`;
                        options = [
                            { text: "It describes the rectangular boxes generated for elements including margin, border, padding, and content", correct: true },
                            { text: "It defines how elements are positioned in relation to each other" },
                            { text: "It controls the layout of grid items" },
                            { text: "It manages the stacking order of elements" }
                        ];
                    } else if (i % 4 === 1) {
                        question = `${levelPrefix}: What is the difference between display: none and visibility: hidden?`;
                        options = [
                            { text: "There is no difference" },
                            { text: "display: none hides it but maintains space, visibility: hidden removes it from layout" },
                            { text: "visibility: hidden is deprecated" },
                            { text: "display: none removes the element from layout, visibility: hidden hides it but maintains space", correct: true },
                        ];
                    } else if (i % 4 === 2) {
                        question = `${levelPrefix}: How does CSS specificity work?`;
                        options = [
                            { text: "It determines which CSS rule is applied based on selector types and importance", correct: true },
                            { text: "It determines how specific a selector is" },
                            { text: "It controls the order of CSS rules" },
                            { text: "It defines the priority of CSS properties" }
                        ];
                    } else {
                        question = `${levelPrefix}: Explain the concept of CSS sprites.`;
                        options = [
                            { text: "Small images used for decoration" },
                            { text: "Combining multiple images into one to reduce HTTP requests", correct: true },
                            { text: "CSS animations that move elements" },
                            { text: "A technique for responsive images" }
                        ];
                    }
                    
                    questions.push({ text: question, options });
                }
            }
            
            return questions;
        }
        
        // Generate JavaScript questions
        function generateJSQuestions(level, subLevel, count) {
            const questions = [];
            const levelPrefix = `${level} (Sub-level ${subLevel})`;
            
            // Beginner questions
            if (level === 'Beginner') {
                for (let i = 1; i <= count; i++) {
                    let question, options;
                    
                    if (i % 4 === 0) {
                        question = `${levelPrefix}: How do you declare a variable in JavaScript?`;
                        options = [
                            { text: "var, let, or const", correct: true },
                            { text: "variable" },
                            { text: "v" },
                            { text: "def" }
                        ];
                    } else if (i % 4 === 1) {
                        question = `${levelPrefix}: What is the correct way to write a JavaScript array?`;
                        options = [
                            { text: "const colors = ('red', 'green', 'blue')" },
                            { text: "const colors = 'red', 'green', 'blue'" },
                            { text: "const colors = ['red', 'green', 'blue']", correct: true },
                            { text: "const colors = {'red', 'green', 'blue'}" }
                        ];
                    } else if (i % 4 === 2) {
                        question = `${levelPrefix}: How do you write a JavaScript function?`;
                        options = [
                            { text: "function myFunction() {}", correct: true },
                            { text: "func myFunction() {}" },
                            { text: "function = myFunction() {}" },
                            { text: "def myFunction() {}" }
                        ];
                    } else {
                        question = `${levelPrefix}: How can you add a comment in JavaScript?`;
                        options = [
                            { text: "<!-- This is a comment -->" },
                            { text: "' This is a comment" },
                            { text: "/* This is a comment */" },
                            { text: "// This is a comment", correct: true }
                        ];
                    }
                    
                    questions.push({ text: question, options });
                }
            }
            // Intermediate questions
            else if (level === 'Intermediate') {
                for (let i = 1; i <= count; i++) {
                    let question, options;
                    
                    if (i % 4 === 0) {
                        question = `${levelPrefix}: What is the output of 'typeof null' in JavaScript?`;
                        options = [
                            { text: "object", correct: true },
                            { text: "null" },
                            { text: "undefined" },
                            { text: "string" }
                        ];
                    } else if (i % 4 === 1) {
                        question = `${levelPrefix}: What is an IIFE in JavaScript?`;
                        options = [
                            { text: "Immediately Integrated Function Expression" },
                            { text: "Immediately Invoked Function Expression", correct: true },
                            { text: "Inline Invoked Function Expression" },
                            { text: "Integrated Invoked Function Expression" }
                        ];
                    } else if (i % 4 === 2) {
                        question = `${levelPrefix}: What is the purpose of the 'this' keyword?`;
                        options = [
                            { text: "It refers to the object it belongs to", correct: true },
                            { text: "It refers to the current function" },
                            { text: "It refers to the parent object" },
                            { text: "It refers to the global object" }
                        ];
                    } else {
                        question = `${levelPrefix}: What is a closure in JavaScript?`;
                        options = [
                            { text: "A way to close a function" },
                            { text: "A method to hide variables" },
                            { text: "A function that retains access to its outer function's scope", correct: true },
                            { text: "A design pattern for objects" }
                        ];
                    }
                    
                    questions.push({ text: question, options });
                }
            }
            // Expert questions
            else if (level === 'Expert') {
                for (let i = 1; i <= count; i++) {
                    let question, options;
                    
                    if (i % 4 === 0) {
                        question = `${levelPrefix}: What is the Event Loop in JavaScript?`;
                        options = [
                            { text: "A loop that handles events" },
                            { text: "A way to loop through events" },
                            { text: "A method for handling event listeners" },
                            { text: "The mechanism that handles asynchronous callbacks", correct: true }
                        ];
                    } else if (i % 4 === 1) {
                        question = `${levelPrefix}: What are JavaScript Generators?`;
                        options = [
                            { text: "Functions that can be exited and later re-entered", correct: true },
                            { text: "Functions that generate values" },
                            { text: "Functions that create other functions" },
                            { text: "Functions that generate random numbers" }
                        ];
                    } else if (i % 4 === 2) {
                        question = `${levelPrefix}: What is the purpose of a Web Worker?`;
                        options = [
                            { text: "To run scripts in background threads", correct: true },
                            { text: "To create web workers" },
                            { text: "To handle HTTP requests" },
                            { text: "To manage service workers" }
                        ];
                    } else {
                        question = `${levelPrefix}: What is memoization in JavaScript?`;
                        options = [
                            { text: "A way to memorize code" },
                            { text: "An optimization technique that caches results", correct: true },
                            { text: "A method for storing data" },
                            { text: "A technique for memoizing functions" }
                        ];
                    }
                    
                    questions.push({ text: question, options });
                }
            }
            // Interview questions
            else {
                for (let i = 1; i <= count; i++) {
                    let question, options;
                    
                    if (i % 4 === 0) {
                        question = `${levelPrefix}: Explain event delegation in JavaScript.`;
                        options = [
                            { text: "A technique where you attach a single event listener to a parent element to manage events for multiple child elements", correct: true },
                            { text: "Assigning events to each element individually" },
                            { text: "A way to delegate events to another thread" },
                            { text: "A method for handling asynchronous events" }
                        ];
                    } else if (i % 4 === 1) {
                        question = `${levelPrefix}: What is the difference between == and === in JavaScript?`;
                        options = [
                            { text: "== compares value and type, === compares value only" },
                            { text: "There is no difference" },
                            { text: "== is for assignment, === is for comparison" },
                            { text: "== compares value only, === compares value and type", correct: true }
                        ];
                    } else if (i % 4 === 2) {
                        question = `${levelPrefix}: What is a Promise in JavaScript?`;
                        options = [
                            { text: "An object representing the eventual completion or failure of an asynchronous operation", correct: true },
                            { text: "A guarantee that a function will complete" },
                            { text: "A way to handle synchronous operations" },
                            { text: "A method for making commitments in code" }
                        ];
                    } else {
                        question = `${levelPrefix}: Explain the concept of hoisting in JavaScript.`;
                        options = [
                            { text: "A way to lift variables up" },
                            { text: "A method for elevating function scope" },
                            { text: "JavaScript's default behavior of moving declarations to the top of their scope", correct: true },
                            { text: "A technique for managing variable visibility" }
                        ];
                    }
                    
                    questions.push({ text: question, options });
                }
            }
            
            return questions;
        }
        
        // Get questions for current selection
        function getQuestionsForSelection() {
            const lang = state.currentLanguage;
            const level = state.currentLevel;
            const subLevel = state.currentSubLevel;
            
            if (window.questionsDB && 
                window.questionsDB[lang] && 
                window.questionsDB[lang][level] && 
                window.questionsDB[lang][level][subLevel]) {
                return window.questionsDB[lang][level][subLevel];
            }
            
            // If no questions found, return sample questions
            return generateJSQuestions('Beginner', 1, 20);
        }
        
        // Initialize the app
        window.addEventListener('DOMContentLoaded', initApp);
