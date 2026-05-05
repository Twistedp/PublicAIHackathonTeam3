from __future__ import annotations

from dataclasses import dataclass, field

import torch
from sentence_transformers import SentenceTransformer, util
from gliner import GLiNER


DEFAULT_EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
DEFAULT_GLINER_MODEL = "urchade/gliner_multi-v2.1"


@dataclass
class ExtractionModels:
    embedding_model: SentenceTransformer
    gliner_model: GLiNER | None = None
    _embedding_cache: dict[str, object] = field(default_factory=dict)

    def encode(self, texts: str | list[str]):
        if isinstance(texts, str):
            if texts not in self._embedding_cache:
                self._embedding_cache[texts] = self.embedding_model.encode(
                    texts,
                    convert_to_tensor=True,
                    normalize_embeddings=True,
                )
            return self._embedding_cache[texts]

        missing = [text for text in texts if text not in self._embedding_cache]
        if missing:
            embeddings = self.embedding_model.encode(
                missing,
                convert_to_tensor=True,
                normalize_embeddings=True,
            )
            for text, embedding in zip(missing, embeddings):
                self._embedding_cache[text] = embedding
        return torch.stack([self._embedding_cache[text] for text in texts])

    def cosine_scores(self, query: str, candidates: list[str]):
        query_embedding = self.encode(query)
        candidate_embeddings = self.encode(candidates)
        return util.cos_sim(query_embedding, candidate_embeddings)[0]

    def best_match(
        self,
        query: str,
        candidates: list[str],
        min_score: float = 0.45,
    ) -> tuple[int, float] | None:
        if not candidates:
            return None
        scores = self.cosine_scores(query, candidates)
        best_idx = int(scores.argmax())
        best_score = float(scores[best_idx])
        if best_score < min_score:
            return None
        return best_idx, best_score


def load_models(
    embedding_model_name: str = DEFAULT_EMBEDDING_MODEL,
    gliner_model_name: str = DEFAULT_GLINER_MODEL,
    load_gliner: bool = True,
) -> ExtractionModels:
    embedding_model = SentenceTransformer(embedding_model_name)
    gliner_model = GLiNER.from_pretrained(gliner_model_name) if load_gliner else None
    return ExtractionModels(embedding_model=embedding_model, gliner_model=gliner_model)
