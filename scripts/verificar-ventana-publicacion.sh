#!/usr/bin/env bash
set -eu

# Evaluate the instant in Lima independently of the runner's time zone.
export LC_ALL=C
time=$(TZ=America/Lima date '+%H:%M')

if [[ ! "$time" < "00:59" && "$time" < "04:30" ]]; then
  printf 'Ventana de publicación abierta (%s, Lima).\n' "$time"
  exit 0
fi

printf 'Ventana cerrada (%s, Lima). La ventana diaria es de 00:59 a 04:30.\n' "$time" >&2
exit 1
