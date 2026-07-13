const REST_API_KEY = "ee948f940e17af65c76bd8a667732fdb";

async function getBooksFromServer(query, sortType) {
    const response = await fetch(`https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&sort=${sortType}&size=6`, {
        method: "GET",
        headers: { "Authorization": `KakaoAK ${REST_API_KEY}` }
    });
    if (!response.ok) {
        throw new Error('네트워크 응답에 문제가 발생했어요.');
    }
    const data = await response.json();
    const books = data.documents;

    return books;
};

function renderBookCards(books, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    if (books.length === 0) {
        container.innerHTML = '<p>검색결과가 없습니다</p> ';
        return;
    }
    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-container';
        card.style.cursor = 'pointer';

        const thumbnailSrc = book.thumbnail ? book.thumbnail : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=150&h=200&fit=crop';

        const formattedPrice = book.sale_price > 0 ? `${book.sale_price.toLocaleString()}원` : '판매 중지 /가격 미정';

        const status = book.status ? book.status : "문의바람"

        const cardHTML = `
            <div class="book-img"> <img src="${thumbnailSrc}" alt="${book.title}"></div>
            <div class="book-condition">${status}</div>
            <div class="book-info">
                <p class="book-from">단행본</p>
                <p class="book-title">${book.title}</p>
                <p class="book-price">${formattedPrice}</p>
            </div>`;

        card.innerHTML = cardHTML;

        card.addEventListener('click', () => {
        window.location.href = `../book-project-sub/index.html?isbn=${book.isbn}`;
         });
        
        
        container.appendChild(card);
    });
};

function renderErrorMessage(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<p>데이터를 가져오지 못했습니다.</p>`;
};

async function initBookSite() {
    try {
        const bestBooks = await getBooksFromServer('베스트셀러', 'accuracy');
        const newBooks = await getBooksFromServer('2026', 'latest');
        renderBookCards(bestBooks, 'bestWrapper');
        renderBookCards(newBooks, 'newWrapper');
    } catch (error) {
        console.error("로딩 중 오류 발생", error);
        renderErrorMessage('bestWrapper');
        renderErrorMessage('newWrapper');
    }

}

initBookSite();
