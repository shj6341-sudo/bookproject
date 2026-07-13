const REST_API_KEY = "ee948f940e17af65c76bd8a667732fdb";

async function getMainBookData(isbn) {
    const response = await fetch(`https://dapi.kakao.com/v3/search/book?query=${isbn}`, {
        method: "GET",
        headers: { "Authorization": `KakaoAK ${REST_API_KEY}` }
    });
    const data = await response.json();
    return data.documents[0];
}

async function getRecommendBooksData(author) {
    const response = await fetch(`https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(author)}&size=6`, {
        method: "GET",
        headers: { "Authorization": `KakaoAK ${REST_API_KEY}` }
    });
    const data = await response.json();
    return data.documents;
}

async function RenderBookPage() {
    const urlParams = new URLSearchParams(window.location.search);
    let currentIsbn = urlParams.get('isbn');
    currentIsbn = currentIsbn.split(' ')[0];
    if (!currentIsbn) return;

    const book = await getMainBookData(currentIsbn);
    if (!book) {
        console.error("책 정보를 찾을 수 없습니다.");
        document.body.innerHTML = "<h1 style='text-align:center; margin-top:50px;'>책 정보를 찾을 수 없습니다. </h1>";
        return;
    }

    let thumbnailSrc = book.thumbnail 
    if (thumbnailSrc && thumbnailSrc.includes('/thumb/R120x174.q85/?fname=')) {
            thumbnailSrc = decodeURIComponent(thumbnailSrc.split('?fname=')[1]);
        };

        // 2. 가공된 큰 이미지 주소를 src에 넣어줍니다.
        thumbnailSrc = thumbnailSrc || "<https://via.placeholder.com/150x220?text=No+Image>";

    const formattedPrice = book.sale_price > 0 ? `${book.sale_price.toLocaleString()}원` : '판매 중지 /가격 미정';
    const oriPrice = book.price > 0 ? `${book.price.toLocaleString()}원` : '판매 중지 /가격 미정';
    const status = book.status ? book.status : "문의바람";
    const datetime = book.datetime.substring(0, 10);
    const authors = book.authors[0];
    const isbn = book.isbn.split(' ')[1] || book.isbn.split(' ')[0];
    const publisher = book.publisher;
    const discountPercent = Math.floor(((book.price - book.sale_price) / book.price) * 100);

    document.getElementById('book-page-top').innerHTML =
        `
        <span class="font-cloud">책 정보 > </span><span>${book.title}</span>
        `;

        document.getElementById("main-book-img").innerHTML =
        `
        <img src="${thumbnailSrc}" alt="${book.title}">
        `

    document.getElementById('aside').innerHTML =
        `
        <aside class="aside-box">
            <h4 class="aside-title">도서정보</h4>
                <div class="row">
                    <p>ISBN</p><span class="aside-font">${isbn}</span>
                </div>
                <div class="row">
                    <p>글쓴이</p> <span class="aside-font">${authors}</span>
                </div>
                <div class="row">
                    <p>출판사</p><span class="aside-font">${publisher}</span>
                </div>
                <div class="row">
                    <p>출간일</p><span class="aside-font">${datetime}</span>
                </div>
                <div class="row">
                    <p>정가</p><span class="aside-font">${oriPrice}</span>
                </div>
            </aside>
        `;

        document.getElementById('book-to-buy-java').innerHTML =
        `
        <div>
            <p class="onto-title">단행본</p>
            <h2 class="book-title">${book.title}</h2>
            <p class="book-reviews"><span class="star">★★★★★</span> (20 Reviews)</p>
        </div>

        <div class="book-buy-container">
            <button>대여</button>
            <button>새책</button>
            <button>중고</button>
        </div>
        <div class="book-price">
            <p>새책 |</p>
            <span class="sale-percent">${discountPercent}%</span>
            <h3 class="book-price-sale">${formattedPrice}</h3>
            <span class="book-price-ori">${oriPrice}</span>
        </div>
        `;

        document.querySelector(".bookInfo-about").innerHTML =
        `
        <h4>도서 설명</h4>
        <p>${book.contents} …</p>
        <button class="bookInfo-about-more">↓ 도서정보 더보기</button>
        `
        const moreBtn = document.querySelector(".bookInfo-about-more")
        moreBtn.style.cursor = 'pointer';
        moreBtn.addEventListener('click', () => {
            window.open(book.url, '_blank');
        });

    const authorName = book.authors[0];
    const recommendBooks = await getRecommendBooksData(authorName);

     if (!recommendBooks) {
        console.error("책 정보를 찾을 수 없습니다.");
        document.body.innerHTML = "<h1 style='text-align:center; margin-top:50px;'>책 정보를 찾을 수 없습니다. </h1>";
        return;
    }

    const recWrapper = document.getElementById('recWrapper');
    recWrapper.innerHTML = '';

    recommendBooks.forEach(recBook => {
        const card = document.createElement('div');
        card.className = 'book-container';
        card.style.cursor = 'pointer';

        const recThumbnailSrc = recBook.thumbnail ? recBook.thumbnail : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=150&h=200&fit=crop';
        const recFormattedPrice = recBook.sale_price > 0 ? `${recBook.sale_price.toLocaleString()}원` : '판매 중지 /가격 미정';
        const recStatus = recBook.status ? recBook.status : "문의바람";


        const containerHTML = `
                    <div class="book-img"> <img src="${recThumbnailSrc}" alt="${recBook.title}"></div>
                    <div class="book-condition">${recStatus}</div>
                    <div class="book-info">
                        <p class="under-book-from">단행본</p>
                        <p class="under-book-title">${recBook.title}</p>
                        <p class="under-book-price">${recFormattedPrice}</p>
                    </div>
            `;
            card.innerHTML = containerHTML;

           card.addEventListener('click', () => {
            console.log("여기까지 ", recBook.sale_price);
            if(recBook.sale_price <= 0 ){
               console.error("책 정보를 찾을 수 없습니다.");
               alert ("책 정보를 찾을 수 없습니다.");
               return;
            } else{
               window.location.href = `./subpage.html?isbn=${recBook.isbn}`;
            }
            });
        recWrapper.appendChild(card);
    });
};

RenderBookPage();