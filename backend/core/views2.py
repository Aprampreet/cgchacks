from io import BytesIO
from ninja import Router, File, Form,Schema
from ninja.files import UploadedFile
from django.shortcuts import get_object_or_404
from users.AuthHelper import JWTAuth
from .models import Session , ExtesionScan
from typing import List
import pickle 
import numpy as np
import pandas as pd
import requests
from django.core.files.uploadedfile import SimpleUploadedFile
core_router = Router()
import os
from django.conf import settings

