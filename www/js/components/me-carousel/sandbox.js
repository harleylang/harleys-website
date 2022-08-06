// eslint-disable-next-line no-undef
const parent = document.querySelector("me-carousel");

const children = `
    <section>
        <img
            src="https://dribbble.s3.amazonaws.com/users/322/screenshots/872485/coldchase.jpg"
            alt="image 1"
        />
        <h3>Me image 1</h3>
        <p>This is image 1</p>
    </section>
    <section>
        <img
            src="https://dribbble.s3.amazonaws.com/users/322/screenshots/980517/icehut_sm.jpg"
            alt="image 2"
        />
        <h3>Me image 2</h3>
        <p>This is image 2</p>
    </section>
    <section>
        <img
            src="https://dribbble.s3.amazonaws.com/users/322/screenshots/943660/hq_sm.jpg"
            alt="image 3"
        />
        <h3>Me image 3</h3>
        <p>This is image 3</p>
    </section>
    <section>
        <img
            src="https://dribbble.s3.amazonaws.com/users/322/screenshots/599584/home.jpg"
            alt="image 4"
        />
        <h3>Me image 4</h3>
        <p>This is image 4</p>
    </section>
    <img
        src="https://dribbble.s3.amazonaws.com/users/322/screenshots/980517/icehut_sm.jpg"
        alt="image 5"
    />
`;

if (parent) parent.innerHTML = children;
