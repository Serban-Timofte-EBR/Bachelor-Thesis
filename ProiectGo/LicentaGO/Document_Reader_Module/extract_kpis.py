import pdfplumber
import re
import difflib
from typing import Dict, Any, List


class KPIExtractor:
    def __init__(self):
        self.kpi_patterns = {
            'ER': [
                re.compile(r'\bER\b.*?(\d+%)', re.IGNORECASE),
                re.compile(r'Estrogen Receptor.*?(\d+%)', re.IGNORECASE),
            ],
            'PR': [
                re.compile(r'\bPR\b.*?(\d+%)', re.IGNORECASE),
                re.compile(r'Progesterone.*?(\d+%)', re.IGNORECASE),
            ],
            'HER2': [
                re.compile(r'HER2.*?(Positive|Negative|Equivocal)', re.IGNORECASE),
            ],
            'Ki-67': [
                re.compile(r'Ki[-–]?67.*?(\d+%)', re.IGNORECASE),
            ],
            'BRCA': [
                re.compile(r'BRCA.*?(Positive|Negative)', re.IGNORECASE),
            ],
            'PD-L1': [
                re.compile(r'PD[- ]?L1.*?(\d+%)', re.IGNORECASE),
            ],
            'MSI': [
                re.compile(r'MSI.*?(Stable|Unstable|High)', re.IGNORECASE),
            ],
            'TMB': [
                re.compile(r'TMB.*?(\d+)', re.IGNORECASE),
            ],
            'NTRK': [
                re.compile(r'NTRK.*?(Positive|Negative)', re.IGNORECASE),
            ],
        }

        self.kpi_synonyms = {
            'ER': ['ER', 'Estrogen Receptor'],
            'PR': ['PR', 'Progesterone'],
            'HER2': ['HER2', 'HER-2'],
            'Ki-67': ['Ki67', 'Ki-67'],
            'PD-L1': ['PDL1', 'PD-L1'],
        }

    def extract_kpis_from_pdf(self, pdf_path: str) -> Dict[str, Any]:
        kpi_results = {}
        unmatched_context = []

        with pdfplumber.open(pdf_path) as pdf:
            text = "\n".join(page.extract_text() or '' for page in pdf.pages)

        text = self._normalize_text(text)
        sentences = re.split(r'(?<=[.!?]) +', text)

        for kpi, patterns in self.kpi_patterns.items():
            matches = []
            for pattern in patterns:
                matches.extend(pattern.findall(text))

            if matches:
                best_match = matches[0].strip().rstrip('%')
                context_window = self._find_context(sentences, kpi, best_match)
                kpi_results[kpi] = {
                    "value": best_match,
                    "confidence": 0.9,
                    "context": context_window
                }
            else:
                fuzzy_match = self._fuzzy_match(text, self.kpi_synonyms[kpi])
                if fuzzy_match:
                    kpi_results[kpi] = {
                        "value": fuzzy_match,
                        "confidence": 0.7,
                        "context": self._find_context(sentences, kpi, fuzzy_match)
                    }
                else:
                    kpi_results[kpi] = {
                        "value": None,
                        "confidence": 0.0,
                        "context": None
                    }
                    unmatched_context.append(kpi)

        print("Unmatched KPIs:", unmatched_context)
        return kpi_results

    def _normalize_text(self, text: str) -> str:
        text = text.replace('\n', ' ')
        text = re.sub(r'\s+', ' ', text)
        return text

    def _find_context(self, sentences: List[str], kpi: str, value: str) -> str:
        for sentence in sentences:
            if kpi.lower() in sentence.lower() or value in sentence:
                return sentence.strip()
        return ""

    def _fuzzy_match(self, text: str, synonyms: List[str]) -> str:
        words = text.split()
        for word in words:
            matches = difflib.get_close_matches(word, synonyms, n=1, cutoff=0.8)
            if matches:
                return word
        return None