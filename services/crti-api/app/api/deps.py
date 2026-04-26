from functools import lru_cache

from ..repository import CompassRepository, repository
from ..ledger import LedgerCommandAdapter, NoopLedgerCommandAdapter
from ..services.processing_flow import ProcessingFlowService
from ..services.view_services import AuditorViewService, DeskViewService, OperatorViewService


@lru_cache
def get_repository() -> CompassRepository:
    return repository


@lru_cache
def get_ledger_adapter() -> LedgerCommandAdapter:
    return NoopLedgerCommandAdapter()


def get_desk_service() -> DeskViewService:
    return DeskViewService(get_repository())


def get_operator_service() -> OperatorViewService:
    return OperatorViewService(get_repository())


def get_auditor_service() -> AuditorViewService:
    return AuditorViewService(get_repository())


def get_processing_flow() -> ProcessingFlowService:
    return ProcessingFlowService(get_repository(), get_ledger_adapter())
