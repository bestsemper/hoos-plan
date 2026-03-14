import re
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright

URL = "https://sisuva.admin.virginia.edu/psp/ihprd/UVSS/SA/s/WEBLIB_HCX_CM.H_COURSE_CATALOG.FieldFormula.IScript_Main?"
SUBJECT_PATTERN = re.compile(r"\b([A-Z]{2,6})\s*-\s*(.*?)\s+View Courses\b")


def extract_subjects(text: str) -> list[tuple[str, str]]:
    subjects: list[tuple[str, str]] = []
    seen: set[tuple[str, str]] = set()

    for code, name in SUBJECT_PATTERN.findall(text):
        item = (code.strip(), name.strip())
        if item not in seen:
            seen.add(item)
            subjects.append(item)

    return subjects


def get_catalog_text() -> str:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto(URL, wait_until="domcontentloaded", timeout=60000)
            page.wait_for_selector("#main_iframe", timeout=60000)

            iframe_element = page.locator("#main_iframe").element_handle()
            if iframe_element is None:
                raise RuntimeError("catalog iframe was not found")

            frame = iframe_element.content_frame()
            if frame is None:
                raise RuntimeError("catalog iframe did not load")

            try:
                frame.wait_for_load_state("networkidle", timeout=60000)
            except PlaywrightTimeoutError:
                pass

            return frame.locator("body").inner_text(timeout=60000)
        finally:
            browser.close()


def main() -> None:
    text = get_catalog_text()
    subjects = extract_subjects(text)

    if not subjects:
        raise RuntimeError("no subjects found in rendered catalog page")

    for code, name in subjects:
        print(f"{code}: {name}")


if __name__ == "__main__":
    main()